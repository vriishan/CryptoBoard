"""app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from coin.views import CoinView
from article.views import ArticleView
from trend.views import TrendView
from sentiment.views import SentimentView

router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/coin/', CoinView.as_view(), name='coin_view'),
    path('api/article/', ArticleView.as_view(), name='article_view'),
    path('api/trend/', TrendView.as_view(), name='trend_view'),
    path('api/sentiment/', SentimentView.as_view(), name='sentiment_view')
]
