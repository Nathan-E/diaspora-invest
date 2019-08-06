const request = require('supertest');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../index');

chai.config.includeStack = true;

describe('## Misc', () => {
  describe('# GET /api/v1/health-check', () => {
    it('should return OK', done => {
      request(app)
        .get('/api/v1/health-check')
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.text).to.equal('OK');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/v1/404', () => {
    it('should return 404 status', done => {
      request(app)
        .get('/api/v1/404')
        .then(res => {
          expect(res.body.message).to.equal('Not found');
          expect(res.body.statusCode).to.equal(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
  });

  describe('# Error Handling', () => {
    it('should handle mongoose CastError - Cast to ObjectId failed', done => {
      request(app)
        .get('/api/v1/users/56z787zzz67fc')
        .then(res => {
          expect(res.body.message).to.equal('Cast to ObjectId failed for value "56z787zzz67fc" at path "_id" for model "User"');
          expect(res.body.statusCode).to.equal(httpStatus.INTERNAL_SERVER_ERROR);
          done();
        })
        .catch(done);
    });

    it('should handle express validation error - username is required', done => {
      request(app)
        .post('/api/v1/users')
        .send({
          mobileNumber: '1234567890',
        })
        .then(res => {
          expect(res.body.message).to.equal('Invalid fields');
          expect(res.body.statusCode).to.equal(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
  });
});
