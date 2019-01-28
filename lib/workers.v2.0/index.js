
const kue = require('kue');

const express = require('express');
const kueUiExpress = require('kue-ui-express');


const app = express();

kue.createQueue();

kueUiExpress(app, '/kue/', '/kue-api');


app.use('/kue-api/', kue.app);
app.listen(3003);


let queue = kue.createQueue({
    redis: {
        host: 'localhost',
        port: 6379
    }
});

kue.app.listen(5000);

const Workers = {
    init() {

        queue.process("email", 5, (job, done) => {
            emailSender(job.data.name, job.data.email)
            .then(success => {
                done('hurray!');
            })
            .catch(err => {
                if (400 <= err.status <= 499) {
                    job.attempts(0, () => {
                        return done(new Error(JSON.stringify(err)));
                    });
                }
                return done(new Error(JSON.stringify(err))); 
            });
        });

        const emailSender = (name, email) => {
            return new Promise((resolve, reject) => {
                let responder = Math.floor(Math.random() * 10) + 1;
                if (responder < 8) {
                    resolve({ success: `Sent Email at ${new Date()}` });
                } else if (responder >= 8 && responder != 10) {
                    reject({ message: "HOLY SHIT EMAIL WAS NOT SENT" });
                }
            });
        };

    },

    runJob() {
        const emailJob = queue.create('email', {  // Job Type
            name: 'Dmytro',                    // Job Data
            email: 'harazdovskiy@gmail.com'
          })
          .attempts(5)
          .backoff({delay: 60*1000, type:'fixed'})
          .save(); // PERSIST THE DAMN JOB LOL

          emailJob.on('failed', function(errorMessage){ // Huh?
            console.log('Job failed');
            let error = JSON.parse(errorMessage);
            console.log(error); // Check it out for yourself
          });

          emailJob.on('complete', function(message){ // Huh?
            console.log('Job successed', message);
          });
    }
};

module.exports = Workers;
