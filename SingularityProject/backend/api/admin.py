from django.contrib import admin
from .models import User
from .models import Project
from .models import UserProject
from .models import Paper
from .models import PaperProject
from .models import UserPaper
from .models import Review
from .models import Tutorial
from .models import RequiredRoles


# Register your models here.

admin.site.register(User)
admin.site.register(Project)
admin.site.register(UserProject)
admin.site.register(Paper)
admin.site.register(PaperProject)
admin.site.register(UserPaper)
admin.site.register(Review)
admin.site.register(Tutorial)
admin.site.register(RequiredRoles)
