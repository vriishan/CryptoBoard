from django.http import JsonResponse
from django.views import View
from app.connection import get_db_handle
from app.settings import COLLECTION_SENTIMENT 

class SentimentView(View):

    def get(self, request, *args, **kwargs):
        # Get query parameters
        coin_name = request.GET.get('name', None)

        query = {}

        # Filter by coin name if provided
        if coin_name:
            query['coin'] = coin_name

        # Query the MongoDB 'sentiment' collection
        db = get_db_handle()
        collection = db[COLLECTION_SENTIMENT]
        cursor = collection.find(query)

        # Convert cursor to list and return as JSON response
        result = list(cursor)
        db.client.close()

        # Serialize MongoDB ObjectIds and other special types to strings
        for doc in result:
            doc['_id'] = str(doc['_id'])

        return JsonResponse(result, safe=False)
