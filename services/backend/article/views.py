from django.http import JsonResponse
from django.views import View
from datetime import datetime
from app.connection import get_db_handle
from app.settings import COLLECTION_ARTICLE

class ArticleView(View):

    def get(self, request, *args, **kwargs):

        # Get query parameters
        coin_name = request.GET.get('name', None)
        start_date = request.GET.get('start_date', None)
        end_date = request.GET.get('end_date', None)
        size = request.GET.get('size', None)

        # If no end date is specified, default to today's date
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')

        query = {}

        # Filter by coin name
        if coin_name:
            query['coin'] = coin_name

        # Filter by date range
        if start_date:
            try:
                start_date_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
                query['timestamp'] = {'$gte': start_date_dt, '$lte': end_date_dt}
            except ValueError:
                return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        # Query MongoDB
        db = get_db_handle()
        collection = db[COLLECTION_ARTICLE]
        cursor = collection.find(query).sort('timestamp', -1)

        # If size is specified, limit the number of results
        if size:
            try:
                size = int(size)
                cursor = cursor.limit(size)
            except ValueError:
                return JsonResponse({'error': 'Size must be an integer.'}, status=400)

        # Convert cursor to list and return as JSON response
        result = list(cursor)
        db.client.close()

        # Serialize MongoDB ObjectIds and datetime objects to strings
        for doc in result:
            doc['_id'] = str(doc['_id'])

        return JsonResponse(result, safe=False)