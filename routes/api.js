'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const issueSchema = new Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
  .get(async function (req, res) {
    const project = req.params.project;
    const query = req.query;
    try {
      // Fetch issues for the given project and apply any filters provided in query parameters
      const issues = await Issue.find({ ...query, project });
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching issues' });
    }
  })
    
  .post(async function (req, res) {
    const project = req.params.project;
    const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;
    
    if (!issue_title || !issue_text || !created_by) {
      return res.json({ error: 'required field(s) missing' });
    }
    
    const newIssue = new Issue({
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      project,
    });
    
    try {
      const savedIssue = await newIssue.save();
      res.json(savedIssue);
    } catch (error) {
      res.status(500).json({ error: 'Error saving issue' });
    }
  })
    
    .put(async function (req, res) {
      const { _id, ...updateFields } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
      updateFields.updated_on = new Date();
      try {
        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true });
        if (!updatedIssue) {
          return res.json({ error: 'could not update', _id });
        }
        res.json({ result: 'successfully updated', _id });
      } catch (error) {
        res.json({ error: 'could not update', _id });
      }
    })
    
    .delete(async function (req, res) {
      const { _id } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id);
        if (!deletedIssue) {
          return res.json({ error: 'could not delete', _id });
        }
        res.json({ result: 'successfully deleted', _id });
      } catch (error) {
        res.json({ error: 'could not delete', _id });
      }
    });
    
};
