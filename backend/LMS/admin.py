from django.contrib import admin
<<<<<<< HEAD

# Register your models here.
=======
from .models import (
    User, Student, Subject, Assignment, Quiz, QuizQuestion, 
    QuizChoice, QuizAttempt, QuizAnswer, Resource, Grade
)

# Register your models here.
admin.site.register(User)
admin.site.register(Student)
admin.site.register(Subject)
admin.site.register(Assignment)
admin.site.register(Quiz)
admin.site.register(QuizQuestion)
admin.site.register(QuizChoice)
admin.site.register(QuizAttempt)
admin.site.register(QuizAnswer)
admin.site.register(Resource)
admin.site.register(Grade)
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
