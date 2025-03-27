from rest_framework.response import Response
from rest_framework.views import APIView

class ExampleView(APIView):
    def get(self, request):
        data = [
            {"id": 1, "name": "Item A"},
            {"id": 2, "name": "Item B"}
        ]
        return Response(data)
