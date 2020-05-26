# What is this?

An emails-input component made for Miro. Technical requirements and an example are presented below.

<div>
    <img src="https://imgur.com/a/WQtu7FU" />
    <img src="https://imgur.com/jXDDJ8K" />
</div>

# Installation

Simple installation via npm.

`### npm install emails-input-miro`

Make sure, that the version is 1.2.0 or higher.

Then...

```
import { EmailsInput } from 'emails-input-miro';

const inputContainerNode  = document.querySelector('#emails-input');
let emailsInput = new EmailsInput(inputContainerNode, { emails, key }); 
```
Important thing is that you always have to pass a parent node as a first argument, whilst the second argument is optional and can be empty.

emails - array of emails 

key - an UNIQUE key to be stored by in localStorage


# API

Method                  | Description                                                                              | Props type
:-----------------------|:-----------------------------------------------------------------------------------------|:-----------------------     
getEmails()             | Returns all entered emails                                                               | -
replaceEmails(emails)   | Replaces all entered emails with passed ones                                             | Strting[] | String
emailsInput.on(callback)| Subscribes for email changes and returns a callback function containing relevant emails  | Function(currentEmails)

