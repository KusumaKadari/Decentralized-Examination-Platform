pragma solidity >= 0.8.11 <= 0.8.11;
pragma experimental ABIEncoderV2;
//Bidding solidity code
contract Question {

    uint public userCount = 0; 
    mapping(uint => user) public userList; 
     struct user
     {
       string username;
       string password;
       string phone;
       string email;
       string user_type;
     }
 
   // events 
   event userCreated(uint indexed _userId);
   
   //function  to save user details to Blockchain
   function saveUser(string memory uname, string memory pass, string memory phone, string memory email, string memory add) public {
      userList[userCount] = user(uname, pass, phone, email, add);
      emit userCreated(userCount);
      userCount++;
    }

     //get user count
    function getUserCount()  public view returns (uint) {
          return  userCount;
    }

    uint public questionCount = 0; 
    mapping(uint => question) public questionList; 
     struct question
     {
       string ipfs_question_id;         
     }
 
   // events 
   event questionCreated(uint indexed _questionId);
   
   //function  to save question details to Blockchain
   function saveQuestion(string memory qid) public {
      questionList[questionCount] = question(qid);
      emit questionCreated(questionCount);
      questionCount++;
    }

    //get question count
    function getQuestionCount()  public view returns (uint) {
          return questionCount;
    }

    uint public performanceCount = 0; 
    mapping(uint => performance) public performanceList; 
     struct performance
     {
       string student_name;
       string question_id;
       string student_answer;
       string exam_date;
     }
 
   // events 
   event performanceCreated(uint indexed _performanceId);
   
   //function  to save performance details to Blockchain
   function savePerformance(string memory sname, string memory qid, string memory answer, string memory dd) public {
     performanceList[performanceCount] = performance(sname, qid, answer, dd);
      emit performanceCreated(performanceCount);
      performanceCount++;
    }

     //get performance count
    function getPerformanceCount()  public view returns (uint) {
          return  performanceCount;
    }

    function getUsername(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.username;
    }

    function getPassword(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.password;
    }

    function getPhone(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.phone;
    }    

    function getEmail(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.email;
    }

    function getUserType(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.user_type;
    }

    function getQuestion(uint i) public view returns (string memory) {
        question memory doc = questionList[i];
	return doc.ipfs_question_id;
    }

    function getStudentName(uint i) public view returns (string memory) {
        performance memory doc = performanceList[i];
	return doc.student_name;
    }
    
    function getAppearQuestion(uint i) public view returns (string memory) {
        performance memory doc = performanceList[i];
	return doc.question_id;
    }

    function getStudentAnswer(uint i) public view returns (string memory) {
        performance memory doc = performanceList[i];
	return doc.student_answer;
    }

    function getExamDate(uint i) public view returns (string memory) {
       performance memory doc = performanceList[i];
       return doc.exam_date;
    }
    
}