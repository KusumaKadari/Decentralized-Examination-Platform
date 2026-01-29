from django.shortcuts import render
from datetime import datetime
from django.template import RequestContext
from django.contrib import messages
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
import os
import json
from web3 import Web3, HTTPProvider
import base64
from datetime import date
import ipfsapi as ipfsApi

global username, questionList, examList, usersList, testList, currentTest
global contract, web3, account
api = ipfsApi.Client(host='http://127.0.0.1', port=5001)

# Test list storage: [{test_number, teacher, num_questions, question_hashes, duration, pass_percentage}]
testList = []
currentTest = {}
archivedTestsList = []  # Store deleted test names for result display
completedExams = []  # Track completed exams: [{student, test_number}]

#function to call contract
def getContract():
    global contract, web3, account
    blockchain_address = 'http://127.0.0.1:9545'
    web3 = Web3(HTTPProvider(blockchain_address))
    account = web3.eth.accounts[0]
    compiled_contract_path = 'Question.json' #Question contract file
    deployed_contract_address = '0x9C8b0eC3326510213A1c2a349D3b7899Ea16e2E8' #contract address
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)  # load contract info as JSON
        contract_abi = contract_json['abi']  # fetch contract's abi - necessary to call its functions
    file.close()
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
getContract()

def getUsersList():
    global usersList, contract
    usersList = []
    count = contract.functions.getUserCount().call()
    for i in range(0, count):
        user = contract.functions.getUsername(i).call()
        password = contract.functions.getPassword(i).call()
        phone = contract.functions.getPhone(i).call()
        email = contract.functions.getEmail(i).call()
        usertype = contract.functions.getUserType(i).call()
        usersList.append([user, password, phone, email, usertype])

def getQuestionList():
    global questionList, contract
    questionList = []
    count = contract.functions.getQuestionCount().call()
    for i in range(0, count):
        question_id = contract.functions.getQuestion(i).call()
        questionList.append([question_id])

def getExamList():
    global examList, contract
    examList = []
    count = contract.functions.getPerformanceCount().call()
    for i in range(0, count):
        sname = contract.functions.getStudentName(i).call()
        appear_question = contract.functions.getAppearQuestion(i).call()
        answer = contract.functions.getStudentAnswer(i).call()
        dd = contract.functions.getExamDate(i).call()
        examList.append([sname, appear_question, answer, dd])
getUsersList()
getQuestionList()    
getExamList()

def getMarks(sname):
    global examList
    total = 0
    count = 0
    for i in range(len(examList)):
        elist = examList[i]
        if elist[0] == sname:
            hashcode = elist[1]
            student_answer = elist[2]
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")            
            if question[5] == student_answer:
                total += 1
            count += 1
            print(str(total)+" "+str(count))
    if total > 0:
        total = total / count
    return round(total, 2) * 100

def ViewStudentMarks(request):
    if request.method == 'GET':
        global examList, username
        # Aggregate results by test
        test_results = {}
        
        for elist in examList:
            if elist[0] == username:
                hashcode = elist[1]
                exam_info = elist[3]
                # Parse exam info: date|test_number|teacher
                parts = exam_info.split("|")
                test_number = parts[1] if len(parts) > 1 else "Unknown"
                teacher = parts[2] if len(parts) > 2 else "Unknown"
                
                content = api.get_pyobj(hashcode)
                content = content.decode()
                question = content.split("@")
                is_correct = elist[2] == question[5]
                correct = 1 if is_correct else 0
                
                if test_number not in test_results:
                    test_results[test_number] = {'correct': 0, 'total': 0, 'teacher': teacher}
                    
                test_results[test_number]['correct'] += correct
                test_results[test_number]['total'] += 1
        
        # Welcome message with username
        output = '<h2>Welcome, '+username+'</h2>'
        output += '<p class="text-muted mb-2">Your exam results</p>'
        
        # Summary Table with Pass/Fail visualization
        output += '<table class="data-table">'
        output += '<thead><tr>'
        output += '<th>Test Number</th>'
        output += '<th>Score</th>'
        output += '<th>Status</th>'
        output += '<th>Conducted By</th>'
        output += '<th>Details</th></tr></thead><tbody>'
        
        for test_number, data in test_results.items():
            percentage = round((data['correct'] / data['total']) * 100, 1) if data['total'] > 0 else 0
            pass_status = "pass" if percentage >= 40 else "fail"
            pass_text = "Pass" if percentage >= 40 else "Fail"
            encoded_test = test_number.replace(' ', '%20')
            
            output += '<tr>'
            output += '<td>'+test_number+'</td>'
            output += '<td><div style="min-width:150px;">'+str(data['correct'])+'/'+str(data['total'])+' ('+str(percentage)+'%)'
            output += '<div class="score-progress-container"><div class="score-progress-bar '+pass_status+'" style="width:'+str(percentage)+'%"></div></div></div></td>'
            output += '<td><span class="result-badge '+pass_status+'">'+pass_text+'</span></td>'
            output += '<td>'+data['teacher']+'</td>'
            output += '<td><a href="/ViewStudentScript?test='+encoded_test+'" class="btn btn-primary btn-sm">View</a></td></tr>'
        
        output += "</tbody></table>"
        
        if len(test_results) == 0:
            output = '<h2>Welcome, '+username+'</h2>'
            output += '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">No Results</div><div class="empty-state-text">You have not taken any exams yet.</div></div>'
        
        context = {'data': output}        
        return render(request, 'StudentScreen.html', context)
        

def ViewTeacherMarks(request):
    if request.method == 'GET':
        global examList, username
        
        # Get filter parameters
        filter_test = request.GET.get('test', '').strip()
        filter_student = request.GET.get('student', '').strip()
        
        # Aggregate results by student and test for this teacher only
        student_results = {}
        
        for elist in examList:
            exam_info = elist[3]
            parts = exam_info.split("|")
            test_number = parts[1] if len(parts) > 1 else "Unknown"
            teacher = parts[2] if len(parts) > 2 else "Unknown"
            
            # Only show results for tests conducted by this teacher
            if teacher != username:
                continue
            
            student_name = elist[0]
            
            # Apply filters
            if filter_test and filter_test.lower() not in test_number.lower():
                continue
            if filter_student and filter_student.lower() not in student_name.lower():
                continue
            
            hashcode = elist[1]
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            is_correct = elist[2] == question[5]
            correct = 1 if is_correct else 0
            
            key = student_name + "|" + test_number
            if key not in student_results:
                student_results[key] = {'student': student_name, 'test': test_number, 'correct': 0, 'total': 0, 'teacher': teacher}
            student_results[key]['correct'] += correct
            student_results[key]['total'] += 1
        
        # Search/Filter Form
        output = '<div class="filter-bar">'
        output += '<div class="filter-group"><label>Test Number</label><input type="text" id="filterTest" placeholder="Search test..." value="'+filter_test+'"></div>'
        output += '<div class="filter-group"><label>Student Name</label><input type="text" id="filterStudent" placeholder="Search student..." value="'+filter_student+'"></div>'
        output += '<div class="filter-actions"><button class="btn btn-primary" onclick="applyFilters()">Search</button>'
        output += '<button class="btn btn-secondary" onclick="clearFilters()">Clear</button></div></div>'
        
        # JavaScript for filtering
        output += '<script>function applyFilters(){var t=document.getElementById("filterTest").value;var s=document.getElementById("filterStudent").value;window.location.href="/ViewTeacherMarks?test="+encodeURIComponent(t)+"&student="+encodeURIComponent(s);}function clearFilters(){window.location.href="/ViewTeacherMarks";}</script>'
        
        # Summary Table with Detailed Script hyperlink and Pass/Fail
        output += '<h3 style="margin-top:1rem;">Results ('+str(len(student_results))+' found)</h3>'
        output += '<table class="data-table">'
        output += '<thead><tr><th>Student</th>'
        output += '<th>Test</th>'
        output += '<th>Score</th>'
        output += '<th>Status</th>'
        output += '<th>Details</th></tr></thead><tbody>'
        
        for key, data in student_results.items():
            percentage = round((data['correct'] / data['total']) * 100, 1) if data['total'] > 0 else 0
            pass_status = "pass" if percentage >= 40 else "fail"
            pass_text = "Pass" if percentage >= 40 else "Fail"
            encoded_student = data['student'].replace(' ', '%20')
            encoded_test = data['test'].replace(' ', '%20')
            output += '<tr><td>'+data['student']+'</td>'
            output += '<td>'+data['test']+'</td>'
            output += '<td><div style="min-width:120px;">'+str(data['correct'])+'/'+str(data['total'])+' ('+str(percentage)+'%)'
            output += '<div class="score-progress-container"><div class="score-progress-bar '+pass_status+'" style="width:'+str(percentage)+'%"></div></div></div></td>'
            output += '<td><span class="result-badge '+pass_status+'">'+pass_text+'</span></td>'
            output += '<td><a href="/ViewTeacherScript?student='+encoded_student+'&test='+encoded_test+'" class="btn btn-primary btn-sm">View</a></td></tr>'
        
        output += "</tbody></table>"
        
        if len(student_results) == 0:
            output += '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">No Results</div><div class="empty-state-text">No students have taken your exams yet, or no results match your filters.</div></div>'
        
        context = {'data': output}        
        return render(request, 'TeacherScreen.html', context)

def ViewMarks(request):
    if request.method == 'GET':
        global examList
        
        # Get filter parameters
        filter_test = request.GET.get('test', '').strip()
        filter_student = request.GET.get('student', '').strip()
        filter_teacher = request.GET.get('teacher', '').strip()
        
        # Aggregate results by student and test (Admin sees all)
        student_results = {}
        for elist in examList:
            exam_info = elist[3]
            parts = exam_info.split("|")
            test_number = parts[1] if len(parts) > 1 else "Unknown"
            teacher = parts[2] if len(parts) > 2 else "Unknown"
            
            student_name = elist[0]
            
            # Apply filters
            if filter_test and filter_test.lower() not in test_number.lower():
                continue
            if filter_student and filter_student.lower() not in student_name.lower():
                continue
            if filter_teacher and filter_teacher.lower() not in teacher.lower():
                continue
            
            hashcode = elist[1]
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            correct = 1 if elist[2] == question[5] else 0
            
            key = student_name + "|" + test_number
            if key not in student_results:
                student_results[key] = {'student': student_name, 'test': test_number, 'correct': 0, 'total': 0, 'teacher': teacher}
            student_results[key]['correct'] += correct
            student_results[key]['total'] += 1
        
        # Search/Filter Form
        output = '<div class="filter-bar">'
        output += '<div class="filter-group"><label>Test Number</label><input type="text" id="filterTest" placeholder="Search test..." value="'+filter_test+'"></div>'
        output += '<div class="filter-group"><label>Student Name</label><input type="text" id="filterStudent" placeholder="Search student..." value="'+filter_student+'"></div>'
        output += '<div class="filter-group"><label>Teacher Name</label><input type="text" id="filterTeacher" placeholder="Search teacher..." value="'+filter_teacher+'"></div>'
        output += '<div class="filter-actions"><button class="btn btn-primary" onclick="applyFilters()">Search</button>'
        output += '<button class="btn btn-secondary" onclick="clearFilters()">Clear</button></div></div>'
        
        # JavaScript for filtering
        output += '<script>function applyFilters(){var t=document.getElementById("filterTest").value;var s=document.getElementById("filterStudent").value;var te=document.getElementById("filterTeacher").value;window.location.href="/ViewMarks?test="+encodeURIComponent(t)+"&student="+encodeURIComponent(s)+"&teacher="+encodeURIComponent(te);}function clearFilters(){window.location.href="/ViewMarks";}</script>'
        
        # Results Table with Pass/Fail visualization
        output += '<h3 style="margin-top:1rem;">Results ('+str(len(student_results))+' found)</h3>'
        output += '<table class="data-table">'
        output += '<thead><tr><th>Student</th>'
        output += '<th>Test</th>'
        output += '<th>Score</th>'
        output += '<th>Status</th>'
        output += '<th>Teacher</th></tr></thead><tbody>'
        
        for key, data in student_results.items():
            percentage = round((data['correct'] / data['total']) * 100, 1) if data['total'] > 0 else 0
            pass_status = "pass" if percentage >= 40 else "fail"
            pass_text = "Pass" if percentage >= 40 else "Fail"
            output += '<tr><td>'+data['student']+'</td>'
            output += '<td>'+data['test']+'</td>'
            output += '<td><div style="min-width:120px;">'+str(data['correct'])+'/'+str(data['total'])+' ('+str(percentage)+'%)'
            output += '<div class="score-progress-container"><div class="score-progress-bar '+pass_status+'" style="width:'+str(percentage)+'%"></div></div></div></td>'
            output += '<td><span class="result-badge '+pass_status+'">'+pass_text+'</span></td>'
            output += '<td>'+data['teacher']+'</td></tr>'
        
        output += "</tbody></table>"
        
        if len(student_results) == 0:
            output += '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">No Results Found</div><div class="empty-state-text">No matching exam results found. Try adjusting your filters.</div></div>'
        
        context = {'data': output}        
        return render(request, 'AdminScreen.html', context)

def ViewQuestions(request):
    if request.method == 'GET':
        global contentList
        output = '<table class="data-table">'
        output+='<thead><tr><th>Question</th>'
        output+='<th>Option A</th>'
        output+='<th>Option B</th>'
        output+='<th>Option C</th>'
        output+='<th>Option D</th>'
        output+='<th>Answer</th></tr></thead><tbody>'
        for i in range(len(questionList)):
            qlist = questionList[i]
            hashcode = qlist[0]
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            output+='<tr><td>'+question[0]+'</td>'
            output+='<td>'+question[1]+'</td>'
            output+='<td>'+question[2]+'</td>'
            output+='<td>'+question[3]+'</td>'
            output+='<td>'+question[4]+'</td>'
            output+='<td><strong>'+question[5]+'</strong></td></tr>'
        output += "</tbody></table>"
        context= {'data':output}        
        return render(request,'AdminScreen.html', context)

def WriteExamAction(request):
    if request.method == 'POST':
        global currentTest, username, examList
        dd = str(date.today())
        total = 0
        answer_script = []  # Store answer details for display
        
        # Get test info from form or currentTest
        test_number = request.POST.get('test_number', currentTest.get('test_number', 'Unknown'))
        teacher_name = request.POST.get('teacher_name', currentTest.get('teacher', 'Unknown'))
        
        # Get questions from current test
        test_questions = currentTest.get('question_hashes', [])
        
        if len(test_questions) == 0:
            context = {'data': 'No test selected. Please select a test first.'}
            return render(request, 'StudentScreen.html', context)
        
        for i, hashcode in enumerate(test_questions):
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            user_answer = request.POST.get("t"+str(i+1), "Not answered")
            if user_answer == False:
                user_answer = "Not answered"
            
            # Save with test info (storing test_number in exam_date field with format: date|test_number|teacher)
            exam_info = dd + "|" + test_number + "|" + teacher_name
            msg = contract.functions.savePerformance(username, hashcode, user_answer, exam_info).transact({'from': account})
            tx_receipt = web3.eth.wait_for_transaction_receipt(msg)
            examList.append([username, hashcode, user_answer, exam_info])
            
            is_correct = question[5] == user_answer
            if is_correct:
                total += 1
            
            answer_script.append({
                'question': question[0],
                'user_answer': user_answer,
                'correct_answer': question[5],
                'is_correct': is_correct
            })
        
        if total > 0:
            total = total / len(test_questions)
        percentage = round(total * 100, 1)
        
        # Track completed exam for one-attempt restriction
        completedExams.append({
            'student': username,
            'test_number': test_number
        })
        
        # Clear current test after submission
        currentTest.clear()
        
        # Build detailed answer script HTML
        output = '<div class="score-card"><div class="score-value">'+str(percentage)+'%</div><div class="score-label">Your Score</div>'
        output += '<div style="margin-top:0.5rem;font-size:0.9rem;opacity:0.9;">Test: '+test_number+' | Conducted by: '+teacher_name+'</div></div>'
        
        output += '<h3 style="margin-top:1.5rem;margin-bottom:1rem;">Detailed Answer Script</h3>'
        output += '<div class="answer-script">'
        
        for i, ans in enumerate(answer_script):
            status_class = "correct" if ans['is_correct'] else "wrong"
            output += '<div class="answer-script-item '+status_class+'">'
            output += '<div class="answer-question">Q'+str(i+1)+'. '+ans['question']+'</div>'
            output += '<div class="answer-row">'
            output += '<div class="answer-col"><div class="answer-label">Your Answer</div>'
            output += '<div class="answer-value '+("correct-text" if ans["is_correct"] else "wrong-text")+'">'+ans['user_answer']+'</div></div>'
            output += '<div class="answer-col"><div class="answer-label">Correct Answer</div>'
            output += '<div class="answer-value correct-text">'+ans['correct_answer']+'</div></div>'
            output += '<div class="answer-col"><div class="answer-label">Status</div>'
            output += '<span class="status-badge '+status_class+'">'+("Correct" if ans["is_correct"] else "Wrong")+'</span></div>'
            output += '</div></div>'
        
        output += '</div>'
        
        context = {'data': output}
        return render(request, 'StudentScreen.html', context)               

def WriteExam(request):
    if request.method == 'GET':
        global currentTest, api, username
        output = ""
        
        # Check if a test is selected
        if not currentTest or 'question_hashes' not in currentTest:
            context = {'data': 'Please select a test first.'}
            return render(request, 'StudentScreen.html', context)
        
        test_questions = currentTest.get('question_hashes', [])
        
        for i, hashcode in enumerate(test_questions):
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            output += '<div class="question-card">'
            output += '<div class="question-text"><span class="question-number">'+str(i+1)+'</span>'+question[0]+'</div>'
            output += '<ul class="option-list">'
            output += '<li class="option-item"><input type="radio" name="t'+str(i+1)+'" value="'+question[1]+'" id="q'+str(i+1)+'a"><label for="q'+str(i+1)+'a">'+question[1]+'</label></li>'
            output += '<li class="option-item"><input type="radio" name="t'+str(i+1)+'" value="'+question[2]+'" id="q'+str(i+1)+'b"><label for="q'+str(i+1)+'b">'+question[2]+'</label></li>'
            output += '<li class="option-item"><input type="radio" name="t'+str(i+1)+'" value="'+question[3]+'" id="q'+str(i+1)+'c"><label for="q'+str(i+1)+'c">'+question[3]+'</label></li>'
            output += '<li class="option-item"><input type="radio" name="t'+str(i+1)+'" value="'+question[4]+'" id="q'+str(i+1)+'d"><label for="q'+str(i+1)+'d">'+question[4]+'</label></li>'
            output += '</ul></div>'
        
        context = {
            'data1': output,
            'test_info': True,
            'test_number': currentTest.get('test_number', ''),
            'teacher_name': currentTest.get('teacher', ''),
            'num_questions': len(test_questions),
            'num_questions_range': range(1, len(test_questions) + 1),
            'duration': currentTest.get('duration', 30),
            'student_name': username
        }
        return render(request, 'WriteExam.html', context)

def CreateTest(request):
    if request.method == 'GET':
        global questionList, api, username
        
        if len(questionList) == 0:
            context = {'no_questions': True, 'teacher_name': username, 'question_hashes': '[]', 'question_texts': '[]'}
            return render(request, 'CreateTest.html', context)
        
        # Build question pool HTML
        questions_html = ""
        question_hashes = []
        question_texts = []
        
        for i, qlist in enumerate(questionList):
            hashcode = qlist[0]
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            question_hashes.append(hashcode)
            question_texts.append(question[0][:50] + "..." if len(question[0]) > 50 else question[0])
            
            questions_html += '<label class="question-checkbox" onclick="toggleSelection(this.querySelector(\'input\'))">'
            questions_html += '<input type="checkbox" name="selected_questions" value="'+hashcode+'" onchange="updateSelectedCount()">'
            questions_html += '<span class="question-checkbox-text"><strong>Q'+str(i+1)+':</strong> '+question[0]+'</span>'
            questions_html += '</label>'
        
        context = {
            'questions_html': questions_html,
            'teacher_name': username,
            'question_hashes': json.dumps(question_hashes),
            'question_texts': json.dumps(question_texts)
        }
        return render(request, 'CreateTest.html', context)

def CreateTestAction(request):
    if request.method == 'POST':
        global testList, username
        
        test_number = request.POST.get('test_number', '')
        selected_questions = request.POST.getlist('selected_questions')
        duration = request.POST.get('duration', '30')
        pass_percentage = request.POST.get('pass_percentage', '40')
        
        try:
            duration = int(duration)
        except ValueError:
            duration = 30
        
        try:
            pass_percentage = int(pass_percentage)
        except ValueError:
            pass_percentage = 40
        
        if not test_number or len(selected_questions) == 0:
            context = {'data': '<div class="alert alert-error">Please enter test number and select questions.</div>', 'teacher_name': username}
            return render(request, 'CreateTest.html', context)
        
        # Check if test number already exists
        for test in testList:
            if test['test_number'] == test_number:
                context = {'data': '<div class="alert alert-error">Test number already exists. Please use a different name.</div>', 'teacher_name': username}
                return render(request, 'CreateTest.html', context)
        
        # Save test with duration and pass percentage
        new_test = {
            'test_number': test_number,
            'teacher': username,
            'num_questions': len(selected_questions),
            'question_hashes': selected_questions,
            'duration': duration,
            'pass_percentage': pass_percentage,
            'status': 'active'  # active or archived
        }
        testList.append(new_test)
        
        context = {'data': '<div class="alert alert-success">Test "'+test_number+'" created successfully with '+str(len(selected_questions))+' questions! Duration: '+str(duration)+' minutes, Pass: '+str(pass_percentage)+'%</div>', 'teacher_name': username}
        return render(request, 'TeacherScreen.html', context)

def SelectTest(request):
    if request.method == 'GET':
        global testList, completedExams, username
        
        # Filter only active tests
        active_tests = [t for t in testList if t.get('status', 'active') == 'active']
        
        if len(active_tests) == 0:
            context = {'no_tests': True, 'student_name': username}
            return render(request, 'SelectTest.html', context)
        
        # Build test list HTML with one-attempt check
        tests_html = ""
        for i, test in enumerate(testList):
            # Skip archived tests
            if test.get('status', 'active') != 'active':
                continue
            
            # Check if student already completed this exam
            already_completed = any(
                ce['student'] == username and ce['test_number'] == test['test_number'] 
                for ce in completedExams
            )
            
            duration = test.get('duration', 30)
            
            tests_html += '<div class="test-select-card">'
            tests_html += '<h4>'+test['test_number']+'</h4>'
            tests_html += '<p><strong>Conducted by:</strong> '+test['teacher']+'</p>'
            tests_html += '<p><strong>Questions:</strong> '+str(test['num_questions'])+'</p>'
            tests_html += '<p><strong>Duration:</strong> '+str(duration)+' minutes</p>'
            
            if already_completed:
                tests_html += '<div class="alert alert-info" style="margin-top:0.5rem;margin-bottom:0;font-size:0.85rem;">✓ You have already completed this exam. Only one attempt is allowed.</div>'
                tests_html += '<button class="btn btn-secondary" disabled style="margin-top:0.5rem;">Exam Completed</button>'
            else:
                tests_html += '<a href="/SelectTestAction?test_index='+str(i)+'" class="btn btn-primary" style="display:inline-block;margin-top:0.5rem;text-decoration:none;">Start Exam</a>'
            
            tests_html += '</div>'
        
        context = {'tests_html': tests_html, 'student_name': username}
        return render(request, 'SelectTest.html', context)

def SelectTestAction(request):
    if request.method == 'GET':
        global testList, currentTest, completedExams, username
        
        test_index = request.GET.get('test_index', None)
        
        if test_index is None:
            context = {'data': 'Invalid test selection.'}
            return render(request, 'StudentScreen.html', context)
        
        try:
            test_index = int(test_index)
            test = testList[test_index]
            
            # Check one-attempt restriction
            already_completed = any(
                ce['student'] == username and ce['test_number'] == test['test_number'] 
                for ce in completedExams
            )
            
            if already_completed:
                context = {'data': '<div class="alert alert-info">You have already completed this exam. Only one attempt is allowed.</div>'}
                return render(request, 'StudentScreen.html', context)
            
            currentTest = test
            return WriteExam(request)
        except (ValueError, IndexError):
            context = {'data': 'Invalid test selection.'}
            return render(request, 'StudentScreen.html', context)

def AddQuestionAction(request):
    if request.method == 'POST':
        global questionList
        question = request.POST.get('t1', False)
        optiona = request.POST.get('t2', False)
        optionb = request.POST.get('t3', False)
        optionc = request.POST.get('t4', False)
        optiond = request.POST.get('t5', False)
        correct = request.POST.get('t6', False)
        data = question+"@"+optiona+"@"+optionb+"@"+optionc+"@"+optiond+"@"+correct
        data = data.encode()
        hashcode = api.add_pyobj(data)
        msg = contract.functions.saveQuestion(hashcode).transact({'from': account})
        tx_receipt = web3.eth.wait_for_transaction_receipt(msg)
        questionList.append([hashcode])
        context= {'data':'<div class="alert alert-success">Question saved to IPFS and Blockchain!</div><p style="margin-top:0.5rem;"><strong>IPFS Hash:</strong> '+hashcode+'</p><details style="margin-top:1rem;"><summary>Transaction Details</summary><pre style="background:#f8fafc;padding:1rem;border-radius:8px;overflow:auto;font-size:0.75rem;">'+str(tx_receipt)+'</pre></details>'}
        return render(request, 'AddQuestion.html', context)        

def AddQuestion(request):
    if request.method == 'GET':
        return render(request,'AddQuestion.html', {})

def TeacherLogin(request):
    if request.method == 'GET':
        return render(request,'TeacherLogin.html', {})

def index(request):
    if request.method == 'GET':
        return render(request,'index.html', {})

def AddUser(request):
    if request.method == 'GET':
       return render(request, 'AddUser.html', {})
    
def AdminLogin(request):
    if request.method == 'GET':
       return render(request, 'AdminLogin.html', {})

def StudentLogin(request):
    if request.method == 'GET':
       return render(request, 'StudentLogin.html', {})

def AddUserAction(request):
    if request.method == 'POST':
        global usersList
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        contact = request.POST.get('t3', False)
        email = request.POST.get('t4', False)
        usertype = request.POST.get('t5', False)
        status = "none"
        for i in range(len(usersList)):
            users = usersList[i]
            if username == users[0]:
                status = "exists"
                break
        if status == "none":
            msg = contract.functions.saveUser(username, password, contact, email, usertype).transact({'from': account})
            tx_receipt = web3.eth.wait_for_transaction_receipt(msg)
            usersList.append([username, password, contact, email, usertype])
            context= {'data':'<div class="alert alert-success">New '+usertype+' successfully added to Blockchain!</div><details style="margin-top:1rem;"><summary>Transaction Details</summary><pre style="background:#f8fafc;padding:1rem;border-radius:8px;overflow:auto;font-size:0.75rem;">'+str(tx_receipt)+'</pre></details>'}
            return render(request, 'AddUser.html', context)
        else:
            context= {'data':'Given username already exists'}
            return render(request, 'AddUser.html', context)

def TeacherLoginAction(request):
    if request.method == 'POST':
        global username, contract, usersList
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        status = 'none'
        for i in range(len(usersList)):
            ulist = usersList[i]
            user1 = ulist[0]
            pass1 = ulist[1]
            if user1 == username and pass1 == password and ulist[4] == "Teacher":
                status = "success"
                break
        if status == 'success':
            output = 'Welcome '+username
            context= {'data':output}
            return render(request, "TeacherScreen.html", context)
        if status == 'none':
            context= {'data':'Invalid login details'}
            return render(request, 'TeacherLogin.html', context)
        
def AdminLoginAction(request):
    if request.method == 'POST':
        global username, contract, usersList
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        status = 'none'
        if username == 'admin' and password == 'admin':
            output = 'Welcome '+username
            context= {'data':output}
            return render(request, "AdminScreen.html", context)
        if status == 'none':
            context= {'data':'Invalid login details'}
            return render(request, 'AdminLogin.html', context)


def StudentLoginAction(request):
    if request.method == 'POST':
        global username, contract, usersList
        username = request.POST.get('t1', False)
        password = request.POST.get('t2', False)
        status = 'none'
        for i in range(len(usersList)):
            ulist = usersList[i]
            user1 = ulist[0]
            pass1 = ulist[1]
            if user1 == username and pass1 == password and ulist[4] == "Student":
                status = "success"
                break
        if status == 'success':
            output = 'Welcome '+username
            context= {'data':output}
            return render(request, "StudentScreen.html", context)
        if status == 'none':
            context= {'data':'Invalid login details'}
            return render(request, 'StudentLogin.html', context)

# Delete Test Functions
def ManageTests(request):
    if request.method == 'GET':
        global testList, username
        
        # Build test list for teacher (only their tests)
        output = '<h3>Your Created Tests</h3>'
        found = False
        for i, test in enumerate(testList):
            if test['teacher'] == username:
                found = True
                output += '<div class="test-list-item">'
                output += '<div class="test-list-info"><h4>'+test['test_number']+'</h4>'
                output += '<div class="test-list-meta">'+str(test['num_questions'])+' questions</div></div>'
                output += '<a href="/DeleteTest?test_index='+str(i)+'" class="btn btn-danger btn-sm" onclick="return confirm(\'Are you sure you want to delete this test? Results will be preserved.\');">Delete</a>'
                output += '</div>'
        
        if not found:
            output = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No tests created</div><div class="empty-state-text">Create a test to see it here</div></div>'
        
        context = {'data': output}
        return render(request, 'TeacherScreen.html', context)

def DeleteTest(request):
    if request.method == 'GET':
        global testList, archivedTestsList, username
        
        test_index = request.GET.get('test_index', None)
        
        if test_index is None:
            context = {'data': '<div class="alert alert-error">Invalid test selection.</div>'}
            return render(request, 'TeacherScreen.html', context)
        
        try:
            test_index = int(test_index)
            test = testList[test_index]
            
            # Check if teacher owns this test
            if test['teacher'] != username:
                context = {'data': '<div class="alert alert-error">You can only delete tests you created.</div>'}
                return render(request, 'TeacherScreen.html', context)
            
            # Archive test for result display
            archivedTestsList.append(test['test_number'])
            
            # Remove from testList
            testList.pop(test_index)
            
            context = {'data': '<div class="alert alert-success">Test deleted successfully. Results have been preserved.</div>'}
            return render(request, 'TeacherScreen.html', context)
        except (ValueError, IndexError):
            context = {'data': '<div class="alert alert-error">Invalid test selection.</div>'}
            return render(request, 'TeacherScreen.html', context)

def AdminManageTests(request):
    if request.method == 'GET':
        global testList
        
        # Build test list for admin (all tests)
        output = '<h3>All Tests</h3>'
        
        if len(testList) == 0:
            output = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No tests created</div><div class="empty-state-text">No tests have been created yet</div></div>'
        else:
            for i, test in enumerate(testList):
                output += '<div class="test-list-item">'
                output += '<div class="test-list-info"><h4>'+test['test_number']+'</h4>'
                output += '<div class="test-list-meta">By: '+test['teacher']+' | '+str(test['num_questions'])+' questions</div></div>'
                output += '<a href="/AdminDeleteTest?test_index='+str(i)+'" class="btn btn-danger btn-sm" onclick="return confirm(\'Are you sure you want to delete this test? Results will be preserved.\');">Delete</a>'
                output += '</div>'
        
        context = {'data': output}
        return render(request, 'AdminScreen.html', context)

def AdminDeleteTest(request):
    if request.method == 'GET':
        global testList, archivedTestsList
        
        test_index = request.GET.get('test_index', None)
        
        if test_index is None:
            context = {'data': '<div class="alert alert-error">Invalid test selection.</div>'}
            return render(request, 'AdminScreen.html', context)
        
        try:
            test_index = int(test_index)
            test = testList[test_index]
            
            # Archive test for result display
            archivedTestsList.append(test['test_number'])
            
            # Remove from testList
            testList.pop(test_index)
            
            context = {'data': '<div class="alert alert-success">Test deleted successfully. Results have been preserved.</div>'}
            return render(request, 'AdminScreen.html', context)
        except (ValueError, IndexError):
            context = {'data': '<div class="alert alert-error">Invalid test selection.</div>'}
            return render(request, 'AdminScreen.html', context)

def ViewDetailedResults(request):
    """Teacher view for detailed answer scripts of their conducted exams"""
    if request.method == 'GET':
        global examList, username
        
        # Group by student and test
        student_tests = {}
        for elist in examList:
            exam_info = elist[3]
            parts = exam_info.split("|")
            test_number = parts[1] if len(parts) > 1 else "Unknown"
            teacher = parts[2] if len(parts) > 2 else "Unknown"
            
            # Only show results for tests conducted by this teacher
            if teacher != username:
                continue
            
            student_name = elist[0]
            hashcode = elist[1]
            content = api.get_pyobj(hashcode)
            content = content.decode()
            question = content.split("@")
            
            key = student_name + "|" + test_number
            if key not in student_tests:
                student_tests[key] = {'student': student_name, 'test': test_number, 'answers': [], 'correct': 0, 'total': 0}
            
            is_correct = elist[2] == question[5]
            student_tests[key]['answers'].append({
                'question': question[0],
                'student_answer': elist[2],
                'correct_answer': question[5],
                'is_correct': is_correct
            })
            if is_correct:
                student_tests[key]['correct'] += 1
            student_tests[key]['total'] += 1
        
        if len(student_tests) == 0:
            output = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">No exam results</div><div class="empty-state-text">No students have taken your exams yet</div></div>'
        else:
            output = '<h3>Detailed Answer Scripts</h3>'
            for key, data in student_tests.items():
                percentage = round((data['correct'] / data['total']) * 100, 1) if data['total'] > 0 else 0
                output += '<div class="card" style="margin-bottom:1.5rem;">'
                output += '<div class="card-header"><span class="card-title">'+data['student']+' - '+data['test']+'</span>'
                output += '<span style="float:right;font-weight:600;">'+str(percentage)+'%</span></div>'
                output += '<div class="answer-script">'
                
                for i, ans in enumerate(data['answers']):
                    status_class = "correct" if ans['is_correct'] else "wrong"
                    output += '<div class="answer-script-item '+status_class+'">'
                    output += '<div class="answer-question">Q'+str(i+1)+'. '+ans['question']+'</div>'
                    output += '<div class="answer-row">'
                    output += '<div class="answer-col"><div class="answer-label">Student Answer</div>'
                    output += '<div class="answer-value '+("correct-text" if ans["is_correct"] else "wrong-text")+'">'+ans['student_answer']+'</div></div>'
                    output += '<div class="answer-col"><div class="answer-label">Correct Answer</div>'
                    output += '<div class="answer-value correct-text">'+ans['correct_answer']+'</div></div>'
                    output += '<div class="answer-col"><div class="answer-label">Status</div>'
                    output += '<span class="status-badge '+status_class+'">'+("Correct" if ans["is_correct"] else "Wrong")+'</span></div>'
                    output += '</div></div>'
                
                output += '</div></div>'
        
        context = {'data': output}
        return render(request, 'TeacherScreen.html', context)

def ViewStudentScript(request):
    """View detailed answer script for a specific test (Student view)"""
    if request.method == 'GET':
        global examList, username
        
        test_filter = request.GET.get('test', None)
        if not test_filter:
            context = {'data': '<div class="alert alert-error">No test specified.</div>'}
            return render(request, 'StudentScreen.html', context)
        
        # Collect answers for this test
        answers = []
        correct_count = 0
        teacher_name = "Unknown"
        
        for elist in examList:
            if elist[0] == username:
                exam_info = elist[3]
                parts = exam_info.split("|")
                test_number = parts[1] if len(parts) > 1 else "Unknown"
                teacher = parts[2] if len(parts) > 2 else "Unknown"
                
                if test_number == test_filter:
                    teacher_name = teacher
                    hashcode = elist[1]
                    content = api.get_pyobj(hashcode)
                    content = content.decode()
                    question = content.split("@")
                    is_correct = elist[2] == question[5]
                    
                    if is_correct:
                        correct_count += 1
                    
                    answers.append({
                        'question': question[0],
                        'user_answer': elist[2],
                        'correct_answer': question[5],
                        'is_correct': is_correct
                    })
        
        if len(answers) == 0:
            context = {'data': '<div class="alert alert-error">No data found for this test.</div>'}
            return render(request, 'StudentScreen.html', context)
        
        percentage = round((correct_count / len(answers)) * 100, 1)
        
        output = '<a href="/ViewStudentMarks" class="btn btn-secondary btn-sm" style="margin-bottom:1rem;">← Back to Marks</a>'
        output += '<div class="card">'
        output += '<div class="card-header"><span class="card-title">'+test_filter+' - Detailed Script</span>'
        output += '<span style="float:right;font-weight:600;">'+str(percentage)+'% ('+str(correct_count)+'/'+str(len(answers))+')</span></div>'
        output += '<p style="padding:0 1rem;color:#64748b;margin-bottom:1rem;">Conducted by: '+teacher_name+'</p>'
        output += '<div class="answer-script">'
        
        for i, ans in enumerate(answers):
            status_class = "correct" if ans['is_correct'] else "wrong"
            output += '<div class="answer-script-item '+status_class+'">'
            output += '<div class="answer-question">Q'+str(i+1)+'. '+ans['question']+'</div>'
            output += '<div class="answer-row">'
            output += '<div class="answer-col"><div class="answer-label">Your Answer</div>'
            output += '<div class="answer-value '+("correct-text" if ans["is_correct"] else "wrong-text")+'">'+ans['user_answer']+'</div></div>'
            output += '<div class="answer-col"><div class="answer-label">Correct Answer</div>'
            output += '<div class="answer-value correct-text">'+ans['correct_answer']+'</div></div>'
            output += '<div class="answer-col"><div class="answer-label">Status</div>'
            output += '<span class="status-badge '+status_class+'">'+("Correct" if ans["is_correct"] else "Wrong")+'</span></div>'
            output += '</div></div>'
        
        output += '</div></div>'
        
        context = {'data': output}
        return render(request, 'StudentScreen.html', context)

def ViewTeacherScript(request):
    """View detailed answer script for a specific student's test (Teacher view)"""
    if request.method == 'GET':
        global examList, username
        
        student_filter = request.GET.get('student', None)
        test_filter = request.GET.get('test', None)
        
        if not student_filter or not test_filter:
            context = {'data': '<div class="alert alert-error">No student or test specified.</div>'}
            return render(request, 'TeacherScreen.html', context)
        
        # Collect answers for this student's test
        answers = []
        correct_count = 0
        
        for elist in examList:
            exam_info = elist[3]
            parts = exam_info.split("|")
            test_number = parts[1] if len(parts) > 1 else "Unknown"
            teacher = parts[2] if len(parts) > 2 else "Unknown"
            
            # Only show if conducted by this teacher
            if teacher != username:
                continue
            
            student_name = elist[0]
            if student_name == student_filter and test_number == test_filter:
                hashcode = elist[1]
                content = api.get_pyobj(hashcode)
                content = content.decode()
                question = content.split("@")
                is_correct = elist[2] == question[5]
                
                if is_correct:
                    correct_count += 1
                
                answers.append({
                    'question': question[0],
                    'student_answer': elist[2],
                    'correct_answer': question[5],
                    'is_correct': is_correct
                })
        
        if len(answers) == 0:
            context = {'data': '<div class="alert alert-error">No data found for this student/test.</div>'}
            return render(request, 'TeacherScreen.html', context)
        
        percentage = round((correct_count / len(answers)) * 100, 1)
        
        output = '<a href="/ViewTeacherMarks" class="btn btn-secondary btn-sm" style="margin-bottom:1rem;">← Back to Marks</a>'
        output += '<div class="card">'
        output += '<div class="card-header"><span class="card-title">'+student_filter+' - '+test_filter+'</span>'
        output += '<span style="float:right;font-weight:600;">'+str(percentage)+'% ('+str(correct_count)+'/'+str(len(answers))+')</span></div>'
        output += '<div class="answer-script">'
        
        for i, ans in enumerate(answers):
            status_class = "correct" if ans['is_correct'] else "wrong"
            output += '<div class="answer-script-item '+status_class+'">'
            output += '<div class="answer-question">Q'+str(i+1)+'. '+ans['question']+'</div>'
            output += '<div class="answer-row">'
            output += '<div class="answer-col"><div class="answer-label">Student Answer</div>'
            output += '<div class="answer-value '+("correct-text" if ans["is_correct"] else "wrong-text")+'">'+ans['student_answer']+'</div></div>'
            output += '<div class="answer-col"><div class="answer-label">Correct Answer</div>'
            output += '<div class="answer-value correct-text">'+ans['correct_answer']+'</div></div>'
            output += '<div class="answer-col"><div class="answer-label">Status</div>'
            output += '<span class="status-badge '+status_class+'">'+("Correct" if ans["is_correct"] else "Wrong")+'</span></div>'
            output += '</div></div>'
        
        output += '</div></div>'
        
        context = {'data': output}
        return render(request, 'TeacherScreen.html', context)
