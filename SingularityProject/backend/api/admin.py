from django.contrib import admin
from .models import User
from .models import Project
from .models import UserProject
from .models import Paper
from .models import PaperProject
from .models import UserPaper

# Register your models here.

admin.site.register(User)
admin.site.register(Project)
admin.site.register(UserProject)
admin.site.register(Paper)
admin.site.register(PaperProject)
admin.site.register(UserPaper)

