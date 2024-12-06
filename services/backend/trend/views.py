from django.http import JsonResponse
from django.views import View
from datetime import datetime
from app.connection import get_db_handle
from app.settings import COLLECTION_ARTICLE

class TrendView(View):

    def get(self, request, *args, **kwargs):

        coin_name = request.GET.get('name', None)
        start_date = request.GET.get('start_date', None)
        end_date = request.GET.get('end_date', None)

        # If no end date is specified, default to today's date
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')

        query = {}

        # Filter by coin name (optional)
        if coin_name:
            query['coin'] = coin_name

        # Parse and filter by date range
        if start_date:
            try:
                start_date_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
                query['timestamp'] = {'$gte': start_date_dt, '$lte': end_date_dt}
            except ValueError:
                return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

            # Calculate the date difference to decide group_by
            delta_days = (end_date_dt - start_date_dt).days

            if 0 <= delta_days <= 60:
                group_by = 'day'
            elif 60 < delta_days <= 180:
                group_by = 'week'
            else:
                group_by = 'month'

        else:
            return JsonResponse({'error': 'Start date is required.'}, status=400)

        # Do truncation
        if group_by == 'day':
            date_trunc_unit = 'day'
            date_format = "%Y-%m-%d"
        elif group_by == 'week':
            date_trunc_unit = 'week'
            date_format = "%Y-%m-%d"  # Weeks are still represented by a starting day
        elif group_by == 'month':
            date_trunc_unit = 'month'
            date_format = "%Y-%m"
        else:
            return JsonResponse({'error': 'Invalid group_by value. Use day, week, or month.'}, status=400)

        # MongoDB aggregation to count articles per coin per specified time interval
        db = get_db_handle()
        collection = db[COLLECTION_ARTICLE]

        pipeline = [
            {"$match": query}, 
            {"$project": {
                "coin": "$coin",
                "source": "$source",
                "date": {"$dateTrunc": {"unit": date_trunc_unit, "date": "$timestamp"}}
            }},
            {"$group": {
                "_id": {"coin": "$coin", "date": "$date"}, 
                "article_count": {"$sum": 1}
            }},
            {"$project": {
                "_id": 0,
                "date": {"$dateToString": {"format": date_format, "date": "$_id.date"}},  
                "coin": "$_id.coin",
                "article_count": 1
            }},
            {"$sort": {"date": 1}} 
        ]

        cursor = collection.aggregate(pipeline)

        # Convert cursor to list and format the results
        result = list(cursor)
        db.client.close()

        return JsonResponse(result, safe=False)
