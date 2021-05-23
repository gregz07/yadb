const { connect } = require('amqplib');

const queueName = 'storyrequests';
const queueOptions = { durable: true, persistent: true, noAck: false };

module.exports.consume = (routine) =>
  connect(`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`)
  .then((conn) => {
    return conn.createChannel().then((ch) => {
      const ok = ch.assertQueue(queueName);

      ok.then(() => {
        ch.prefetch(1);
      });

      ok.then(() => {
        ch.consume(queue, routine, { noAck: false });
      });

    }).catch(() => {
      console.log('Connection to queue failed');
    })
  });
 
module.exports.enqueue = (queueItem) => {
  connect(`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`)
    .then(con => con.createChannel())
    .then(ch =>
      ch.assertQueue(queueName, queueOptions)
        .then(ok => {
          resolve(ch.sendToQueue(queueName, Buffer.from(queueItem)));
        })
    )
    .catch(err => reject(err));
}
