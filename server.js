var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
  id: 1,
  description: 'Meet Mom for lunch',
  completed: false
}, {
  id: 2,
  description: 'Go to market',
  completed: false
}, {
  id: 3,
  description: 'Pack clothes',
  completed: true
}];

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// GET /todos
// GET /todos/id

app.get('/todos', function(req, res) {
  res.json(todos);
});

app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id);
  var matchedTodo;
  
  todos.forEach(function(todo) {
    if (todo.id === todoId) {
      matchedTodo = todo;
    }
  });
  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();  
  }
  
//  res.send('Asking for todo with id of ' + req.params.id);
});

app.listen(PORT, function() {
  console.log('Express listening on port ' + PORT);
});