process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { launch } = require('../lib/server');
const should = chai.should();

chai.use(chaiHttp);

describe('Registries', () => {
  let url, server

  before(async () => ({ server, url } = await launch()))

  describe('GET / and all registries', () => {
    it('should GET the index', async () => {
      const res = await chai.request(url).get('/')

      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.registries.should.be.a('array')

      for await (const path of res.body.registries) {
        const res = await chai.request(url).get(path)
        res.should.have.status(200);
        res.body.should.be.a('object');
      }
    });
  });

  describe('POST /upstream', () => {
    it('should fail triggering a pull', async () => {
      const res = await chai.request(url).post('/upstream')
      res.should.have.status(404);
    })

    it('should trigger a pull', async () => {
      const res = await chai.request(url)
            .post('/upstream')
            .set('User-Agent', 'GitHub-Hookshot')
            .send("")
      res.should.have.status(204);
    })
  });

  after(async () => await server.close())
})
