const mysql = require('mysql2');

const connection = mysql.createConnection({
  host     : '127.0.0.1',    // IP 주소 뒤에 있던 공백을 제거했습니다.
  port     : 3306,
  user     : 'root',
  password : '05110117',
  database : 'INQUIRY2'
});

// connect() 함수 안에 모든 로직을 넣습니다.
connection.connect(err => {
  if (err) {
    console.error('DB 연결 실패:', err);
    return;
  }
  console.log('DB 연결 성공!');

  // 연결이 성공한 후에 쿼리를 실행합니다.
  connection.query('SELECT * FROM USERS', (err, results, fields) => {
    if (err) {
      console.error('쿼리 실행 오류:', err);
    } else {
      // 쿼리 성공 시 결과 출력
      console.log(results);
    }

    //쿼리 실행이 끝난 후에 연결을 종료합니다.
    connection.end(err => {
      if (err) {
        return console.error('DB 연결 종료 오류:', err);
      }
      console.log('DB 연결이 성공적으로 종료되었습니다.');
    });
  });
});