from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=100, write_only=True)
    user_type = serializers.ChoiceField(
        choices=['Admin', 'Teacher', 'Student'],
        required=True
    )


class UserSerializer(serializers.Serializer):
    """Serializer for user creation and display"""
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=100, write_only=True, required=False)
    phone = serializers.CharField(max_length=20, required=False)
    email = serializers.EmailField(required=False)
    user_type = serializers.ChoiceField(
        choices=['Teacher', 'Student'],
        required=True
    )


class QuestionSerializer(serializers.Serializer):
    """Serializer for question creation"""
    question = serializers.CharField()
    option_a = serializers.CharField()
    option_b = serializers.CharField()
    option_c = serializers.CharField()
    option_d = serializers.CharField()
    correct_answer = serializers.CharField()


class QuestionDisplaySerializer(serializers.Serializer):
    """Serializer for displaying questions"""
    id = serializers.IntegerField(read_only=True)
    hash = serializers.CharField(read_only=True)
    question = serializers.CharField()
    option_a = serializers.CharField()
    option_b = serializers.CharField()
    option_c = serializers.CharField()
    option_d = serializers.CharField()
    correct_answer = serializers.CharField()


class TestCreateSerializer(serializers.Serializer):
    """Serializer for test creation"""
    test_number = serializers.CharField(max_length=100)
    selected_questions = serializers.ListField(
        child=serializers.CharField(),
        min_length=1
    )
    duration = serializers.IntegerField(default=30, min_value=1, max_value=180)
    pass_percentage = serializers.IntegerField(default=40, min_value=0, max_value=100)


class TestSerializer(serializers.Serializer):
    """Serializer for test display"""
    test_number = serializers.CharField()
    teacher = serializers.CharField()
    num_questions = serializers.IntegerField()
    duration = serializers.IntegerField()
    pass_percentage = serializers.IntegerField()
    status = serializers.CharField()
    question_hashes = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    already_completed = serializers.BooleanField(required=False, default=False)


class ExamAnswerSerializer(serializers.Serializer):
    """Serializer for individual exam answers"""
    question_index = serializers.IntegerField()
    answer = serializers.CharField()


class ExamSubmitSerializer(serializers.Serializer):
    """Serializer for exam submission"""
    test_number = serializers.CharField()
    teacher_name = serializers.CharField()
    answers = serializers.ListField(
        child=serializers.DictField()
    )


class ResultSerializer(serializers.Serializer):
    """Serializer for exam results"""
    student = serializers.CharField()
    test = serializers.CharField()
    teacher = serializers.CharField()
    correct = serializers.IntegerField()
    total = serializers.IntegerField()
    percentage = serializers.FloatField()
    passed = serializers.BooleanField()


class AnswerScriptItemSerializer(serializers.Serializer):
    """Serializer for individual answer script items"""
    question_number = serializers.IntegerField()
    question = serializers.CharField()
    user_answer = serializers.CharField()
    correct_answer = serializers.CharField()
    is_correct = serializers.BooleanField()


class AnswerScriptSerializer(serializers.Serializer):
    """Serializer for full answer script"""
    student = serializers.CharField()
    test = serializers.CharField()
    teacher = serializers.CharField()
    score = serializers.FloatField()
    correct = serializers.IntegerField()
    total = serializers.IntegerField()
    passed = serializers.BooleanField()
    answers = AnswerScriptItemSerializer(many=True)
