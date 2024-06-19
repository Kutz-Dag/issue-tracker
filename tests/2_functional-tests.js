const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
require("../db-connect");

chai.use(chaiHttp);

let delete_id;
suite('Functional Tests', function() {

    suite('POST /api/issues/{project}', function() {
      test('Create an issue with every field', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Issue Title',
            issue_text: 'Issue text.',
            created_by: 'Author',
            assigned_to: 'User',
            status_text: 'In progress'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            delete_id = res.body._id;
            assert.equal(res.body.issue_title, 'Issue Title');
            assert.equal(res.body.issue_text, 'Issue text.');
            assert.equal(res.body.created_by, 'Author');
            assert.equal(res.body.assigned_to, 'User');
            assert.equal(res.body.status_text, 'In progress');
            done();
          });
      });
  
      test('Create an issue with only required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Issue Title',
            issue_text: 'Issue text.',
            created_by: 'Author'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Issue Title');
            assert.equal(res.body.issue_text, 'Issue text.');
            assert.equal(res.body.created_by, 'Author');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            done();
          });
      });
  
      test('Create an issue with missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Issue Title'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'required field(s) missing');
            done();
          });
      });
    });
  
    suite('GET /api/issues/{project}', function() {
      test('View issues on a project', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
  
      test('View issues on a project with one filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: true })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach(issue => assert.equal(issue.open, true));
            done();
          });
      });
  
      test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: true, created_by: 'Author' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach(issue => {
              assert.equal(issue.open, true);
              assert.equal(issue.created_by, 'Author');
            });
            done();
          });
      });
    });
  
    suite('PUT /api/issues/{project}', function() {
      test('Update one field on an issue', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: '6672ab455b459ba2e8ed7b8a',
          issue_text: 'Updated text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, '6672ab455b459ba2e8ed7b8a');
          done();
        });
      });
  
      test('Update multiple fields on an issue', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
        _id: '6672ab455b459ba2e8ed7b8a',
        issue_title: 'Updated title',
        issue_text: 'Updated text.'
        })
        .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, '6672ab455b459ba2e8ed7b8a');
        done();
        });
      });
  
      test('Update an issue with missing _id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            issue_title: 'Updated title'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
  
      test('Update an issue with no fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: 'validIssueId'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, 'validIssueId');
            done();
          });
      });
  
      test('Update an issue with an invalid _id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: 'invalidIssueId',
            issue_text: 'Updated text.'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, 'invalidIssueId');
            done();
          });
      });
    });
  
    suite('DELETE /api/issues/{project}', function() {
      test('Delete an issue', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({
            _id: delete_id,
            })
            .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully deleted');
            done();
            });
      });
  
      test('Delete an issue with an invalid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            _id: 'invalidIssueId'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, 'invalidIssueId');
            done();
          });
      });
  
      test('Delete an issue with missing _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
    });
  
  });
