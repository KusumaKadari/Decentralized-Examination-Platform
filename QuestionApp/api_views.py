"""
REST API Views for the Examination Platform

These views wrap the existing blockchain/IPFS logic and expose it as a REST API.
The core blockchain and IPFS logic remains unchanged.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from datetime import date
import json

from .serializers import (
    LoginSerializer, UserSerializer, QuestionSerializer, QuestionDisplaySerializer,
    TestCreateSerializer, TestSerializer, ExamSubmitSerializer, ResultSerializer,
    AnswerScriptSerializer, AnswerScriptItemSerializer
)

# Import blockchain/IPFS logic from views.py
from .views import (
    contract, web3, account, api,
    usersList, questionList, examList, testList, completedExams, archivedTestsList,
    getUsersList, getQuestionList, getExamList
)


# ============================================
# Authentication Endpoints
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Authenticate user and return user info
    Supports Admin, Teacher, and Student roles
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    user_type = serializer.validated_data['user_type']
    
    # Admin login (hardcoded)
    if user_type == 'Admin':
        if username == 'admin' and password == 'admin':
            return Response({
                'success': True,
                'user': {
                    'username': username,
                    'user_type': 'Admin'
                }
            })
        return Response({
            'success': False,
            'error': 'Invalid admin credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Teacher/Student login from blockchain
    global usersList
    for user in usersList:
        if user[0] == username and user[1] == password and user[4] == user_type:
            return Response({
                'success': True,
                'user': {
                    'username': username,
                    'user_type': user_type,
                    'phone': user[2],
                    'email': user[3]
                }
            })
    
    return Response({
        'success': False,
        'error': 'Invalid login credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """Logout user"""
    return Response({'success': True, 'message': 'Logged out successfully'})


# ============================================
# User Management Endpoints
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def users(request):
    """
    GET: List all users (for Admin)
    POST: Create a new user (Teacher or Student)
    """
    global usersList, contract, web3, account
    
    if request.method == 'GET':
        users_data = []
        for user in usersList:
            users_data.append({
                'username': user[0],
                'phone': user[2],
                'email': user[3],
                'user_type': user[4]
            })
        return Response({'users': users_data})
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data.get('password', '')
        phone = serializer.validated_data.get('phone', '')
        email = serializer.validated_data.get('email', '')
        user_type = serializer.validated_data['user_type']
        
        # Check if user already exists
        for user in usersList:
            if user[0] == username:
                return Response({
                    'success': False,
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save to blockchain
        try:
            msg = contract.functions.saveUser(username, password, phone, email, user_type).transact({'from': account})
            tx_receipt = web3.eth.wait_for_transaction_receipt(msg)
            usersList.append([username, password, phone, email, user_type])
            
            return Response({
                'success': True,
                'message': f'New {user_type} successfully added!',
                'tx_hash': tx_receipt.transactionHash.hex()
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# Question Management Endpoints
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def questions(request):
    """
    GET: List all questions from IPFS/blockchain
    POST: Add a new question to IPFS and blockchain
    """
    global questionList, contract, web3, account, api
    
    if request.method == 'GET':
        questions_data = []
        for i, qlist in enumerate(questionList):
            hashcode = qlist[0]
            try:
                content = api.get_pyobj(hashcode)
                content = content.decode()
                question = content.split("@")
                
                # Check for teacher stored in 7th element (index 6)
                teacher = question[6] if len(question) > 6 else "Kusuma"
                
                questions_data.append({
                    'id': i,
                    'hash': hashcode,
                    'question': question[0],
                    'option_a': question[1],
                    'option_b': question[2],
                    'option_c': question[3],
                    'option_d': question[4],
                    'correct_answer': question[5],
                    'teacher': teacher
                })
            except Exception as e:
                continue
        return Response({'questions': questions_data})
    
    elif request.method == 'POST':
        serializer = QuestionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        teacher = request.data.get('teacher', 'Unknown')
        
        # Build question string for IPFS
        data = "@".join([
            serializer.validated_data['question'],
            serializer.validated_data['option_a'],
            serializer.validated_data['option_b'],
            serializer.validated_data['option_c'],
            serializer.validated_data['option_d'],
            serializer.validated_data['correct_answer'],
            teacher
        ])
        data = data.encode()
        
        try:
            # Save to IPFS
            hashcode = api.add_pyobj(data)
            
            # Save hash to blockchain
            msg = contract.functions.saveQuestion(hashcode).transact({'from': account})
            tx_receipt = web3.eth.wait_for_transaction_receipt(msg)
            questionList.append([hashcode])
            
            return Response({
                'success': True,
                'message': 'Question saved to IPFS and Blockchain!',
                'ipfs_hash': hashcode,
                'tx_hash': tx_receipt.transactionHash.hex()
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# Test Management Endpoints
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def tests(request):
    """
    GET: List all tests (filtered by teacher if provided)
    POST: Create a new test
    """
    global testList, questionList
    
    if request.method == 'GET':
        teacher = request.query_params.get('teacher', None)
        student = request.query_params.get('student', None)
        
        tests_data = []
        for i, test in enumerate(testList):
            # Skip archived tests for students
            if student and test.get('status', 'active') != 'active':
                continue
            
            # Filter by teacher if provided
            if teacher and test['teacher'] != teacher:
                continue
            
            # Check if student already completed
            already_completed = False
            if student:
                already_completed = any(
                    ce['student'] == student and ce['test_number'] == test['test_number']
                    for ce in completedExams
                )
            
            tests_data.append({
                'index': i,
                'test_number': test['test_number'],
                'teacher': test['teacher'],
                'num_questions': test['num_questions'],
                'duration': test.get('duration', 30),
                'pass_percentage': test.get('pass_percentage', 40),
                'status': test.get('status', 'active'),
                'already_completed': already_completed
            })
        
        return Response({'tests': tests_data})
    
    elif request.method == 'POST':
        serializer = TestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        test_number = serializer.validated_data['test_number']
        selected_questions = serializer.validated_data['selected_questions']
        duration = serializer.validated_data.get('duration', 30)
        pass_percentage = serializer.validated_data.get('pass_percentage', 40)
        teacher = request.data.get('teacher', 'Unknown')
        
        # Check if test number already exists
        for test in testList:
            if test['test_number'] == test_number:
                return Response({
                    'success': False,
                    'error': 'Test number already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new test
        new_test = {
            'test_number': test_number,
            'teacher': teacher,
            'num_questions': len(selected_questions),
            'question_hashes': selected_questions,
            'duration': duration,
            'pass_percentage': pass_percentage,
            'status': 'active'
        }
        testList.append(new_test)
        
        return Response({
            'success': True,
            'message': f'Test "{test_number}" created successfully with {len(selected_questions)} questions!'
        }, status=status.HTTP_201_CREATED)


@api_view(['DELETE', 'PUT', 'GET'])
@permission_classes([AllowAny])
def test_detail(request, test_index):
    """
    DELETE: Delete a test (archive it)
    PUT: Update a test
    GET: Get test details
    """
    global testList, archivedTestsList, questionList, api
    
    teacher = request.query_params.get('teacher', None)
    
    try:
        test_index = int(test_index)
        if test_index < 0 or test_index >= len(testList):
            raise IndexError("Test index out of range")
        
        test = testList[test_index]
        
        # Check permissions for delete/update
        if request.method in ['DELETE', 'PUT']:
             # For update, teacher might be in body
            req_teacher = teacher or request.data.get('teacher')
            if req_teacher and test['teacher'] != req_teacher:
                return Response({
                    'success': False,
                    'error': 'You can only manage tests you created'
                }, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'DELETE':
            # Soft delete: Mark as archived instead of removing
            # This preserves indices and history
            if test.get('status') == 'archived':
                 return Response({
                    'success': False,
                    'error': 'Test is already archived'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            test['status'] = 'archived'
            # archivedTestsList.append(test['test_number']) # Optional: keep if used elsewhere
            
            return Response({
                'success': True,
                'message': 'Test archived successfully. Students can no longer access it, but results are preserved.'
            })

        elif request.method == 'PUT':
            # Update test details
            # We don't allow changing test_number to avoid breaking links
            
            selected_questions = request.data.get('selected_questions')
            duration = request.data.get('duration')
            pass_percentage = request.data.get('pass_percentage')
            
            if selected_questions is not None:
                test['question_hashes'] = selected_questions
                test['num_questions'] = len(selected_questions)
                
            if duration is not None:
                test['duration'] = int(duration)
                
            if pass_percentage is not None:
                test['pass_percentage'] = int(pass_percentage)
                
            return Response({
                'success': True,
                'message': 'Test updated successfully'
            })
            
        elif request.method == 'GET':
             # Return test details for editing
            questions_data = []
            for i, qlist in enumerate(questionList):
                hashcode = qlist[0]
                # Check if this question is selected in the test
                is_selected = hashcode in test.get('question_hashes', [])
                
                # Fetch question text for display
                try:
                    content = api.get_pyobj(hashcode)
                    content = content.decode()
                    question = content.split("@")
                    
                    # Return full details for teacher editing/viewing
                    teacher_uname = question[6] if len(question) > 6 else "Kusuma"
                    
                    questions_data.append({
                        'id': i,
                        'hash': hashcode,
                        'question': question[0],
                        'option_a': question[1],
                        'option_b': question[2],
                        'option_c': question[3],
                        'option_d': question[4],
                        'correct_answer': question[5],
                        'teacher': teacher_uname,
                        'selected': is_selected
                    })
                except Exception:
                    continue
                    
            return Response({
                'success': True,
                'test': test,
                'questions': questions_data
            })

    except (ValueError, IndexError):
        return Response({
            'success': False,
            'error': 'Invalid test selection'
        }, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# Exam Endpoints
# ============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def select_test(request, test_index):
    """Get test details for exam"""
    global testList, completedExams, api
    
    student = request.query_params.get('student', None)
    
    try:
        test_index = int(test_index)
        test = testList[test_index]
        
        # Check one-attempt restriction
        if student:
            already_completed = any(
                ce['student'] == student and ce['test_number'] == test['test_number']
                for ce in completedExams
            )
            if already_completed:
                return Response({
                    'success': False,
                    'error': 'You have already completed this exam. Only one attempt is allowed.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Get questions from IPFS
        questions_data = []
        for i, hashcode in enumerate(test.get('question_hashes', [])):
            try:
                content = api.get_pyobj(hashcode)
                content = content.decode()
                question = content.split("@")
                questions_data.append({
                    'index': i,
                    'hash': hashcode,
                    'question': question[0],
                    'option_a': question[1],
                    'option_b': question[2],
                    'option_c': question[3],
                    'option_d': question[4]
                    # Note: correct_answer is not sent to client during exam
                })
            except Exception:
                continue
        
        return Response({
            'success': True,
            'test': {
                'test_number': test['test_number'],
                'teacher': test['teacher'],
                'duration': test.get('duration', 30),
                'num_questions': test['num_questions'],
                'pass_percentage': test.get('pass_percentage', 40)
            },
            'questions': questions_data
        })
    except (ValueError, IndexError):
        return Response({
            'success': False,
            'error': 'Invalid test selection'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_exam(request):
    """Submit exam answers and calculate results"""
    global examList, completedExams, contract, web3, account, api
    
    student = request.data.get('student', 'Unknown')
    test_number = request.data.get('test_number', 'Unknown')
    teacher_name = request.data.get('teacher_name', 'Unknown')
    answers = request.data.get('answers', {})  # {question_hash: answer}
    
    dd = str(date.today())
    total_correct = 0
    total_questions = len(answers)
    answer_script = []
    
    for hashcode, user_answer in answers.items():
        try:
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            
            # Save to blockchain
            exam_info = f"{dd}|{test_number}|{teacher_name}"
            msg = contract.functions.savePerformance(student, hashcode, user_answer, exam_info).transact({'from': account})
            tx_receipt = web3.eth.wait_for_transaction_receipt(msg)
            examList.append([student, hashcode, user_answer, exam_info])
            
            is_correct = question[5] == user_answer
            if is_correct:
                total_correct += 1
            
            answer_script.append({
                'question': question[0],
                'user_answer': user_answer,
                'correct_answer': question[5],
                'is_correct': is_correct
            })
        except Exception as e:
            continue
    
    # Calculate percentage
    percentage = round((total_correct / total_questions) * 100, 1) if total_questions > 0 else 0
    
    # Track completed exam
    completedExams.append({
        'student': student,
        'test_number': test_number
    })
    
    return Response({
        'success': True,
        'result': {
            'score': percentage,
            'correct': total_correct,
            'total': total_questions,
            'passed': percentage >= 40,
            'test_number': test_number,
            'teacher': teacher_name
        },
        'answer_script': answer_script
    })


# ============================================
# Results Endpoints
# ============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def results(request):
    """
    Get exam results
    - For students: filter by student username
    - For teachers: filter by teacher username (their tests only)
    - For admin: all results
    """
    global examList, api
    
    student = request.query_params.get('student', None)
    teacher = request.query_params.get('teacher', None)
    filter_test = request.query_params.get('test', '')
    filter_student = request.query_params.get('filter_student', '')
    
    # Aggregate results by student and test
    student_results = {}
    
    for elist in examList:
        exam_info = elist[3]
        parts = exam_info.split("|")
        test_number = parts[1] if len(parts) > 1 else "Unknown"
        test_teacher = parts[2] if len(parts) > 2 else "Unknown"
        student_name = elist[0]
        
        # Apply role-based filters
        if student and student_name != student:
            continue
        if teacher and test_teacher != teacher:
            continue
        
        # Apply search filters
        if filter_test and filter_test.lower() not in test_number.lower():
            continue
        if filter_student and filter_student.lower() not in student_name.lower():
            continue
        
        try:
            hashcode = elist[1]
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            correct = 1 if elist[2] == question[5] else 0
            
            key = f"{student_name}|{test_number}"
            if key not in student_results:
                student_results[key] = {
                    'student': student_name,
                    'test': test_number,
                    'teacher': test_teacher,
                    'correct': 0,
                    'total': 0
                }
            student_results[key]['correct'] += correct
            student_results[key]['total'] += 1
        except Exception:
            continue
    
    # Build response
    results_data = []
    for key, data in student_results.items():
        percentage = round((data['correct'] / data['total']) * 100, 1) if data['total'] > 0 else 0
        results_data.append({
            'student': data['student'],
            'test': data['test'],
            'teacher': data['teacher'],
            'correct': data['correct'],
            'total': data['total'],
            'percentage': percentage,
            'passed': percentage >= 40
        })
    
    return Response({'results': results_data})


@api_view(['GET'])
@permission_classes([AllowAny])
def answer_script(request):
    """Get detailed answer script for a specific test"""
    global examList, api
    
    student = request.query_params.get('student', None)
    test = request.query_params.get('test', None)
    
    if not student or not test:
        return Response({
            'success': False,
            'error': 'Student and test parameters are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    answers = []
    teacher = "Unknown"
    q_num = 1
    
    for elist in examList:
        exam_info = elist[3]
        parts = exam_info.split("|")
        test_number = parts[1] if len(parts) > 1 else "Unknown"
        test_teacher = parts[2] if len(parts) > 2 else "Unknown"
        student_name = elist[0]
        
        if student_name == student and test_number == test:
            teacher = test_teacher
            try:
                hashcode = elist[1]
                content = api.get_pyobj(hashcode)
                content = content.decode()
                question = content.split("@")
                
                answers.append({
                    'question_number': q_num,
                    'question': question[0],
                    'option_a': question[1],
                    'option_b': question[2],
                    'option_c': question[3],
                    'option_d': question[4],
                    'user_answer': elist[2],
                    'correct_answer': question[5],
                    'is_correct': elist[2] == question[5]
                })
                q_num += 1
            except Exception:
                continue
    
    # Calculate score
    correct = sum(1 for a in answers if a['is_correct'])
    total = len(answers)
    percentage = round((correct / total) * 100, 1) if total > 0 else 0
    
    return Response({
        'success': True,
        'script': {
            'student': student,
            'test': test,
            'teacher': teacher,
            'score': percentage,
            'correct': correct,
            'total': total,
            'passed': percentage >= 40,
            'answers': answers
        }
    })
