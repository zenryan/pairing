const { privateKey, publicKey } = require('./key');
const axios = require('axios');
const NodeRSA = require('node-rsa');

const key = new NodeRSA();

const http = axios.create({
  baseURL: 'endpoint.dev/api',
  headers: {
    post: {
      'Content-Type': 'application/json',
    },
  },
});

const verify = (reqPayload, signature) => {
  return key.verify(reqPayload, signature, 'pkcs8-private', 'base64');
};

const postRequest = async (accountId, reqPayload) => {
  key.importKey(privateKey, 'pkcs8-private');
  const sign = key.sign(reqPayload, 'base64');
  try {
    const { data } = await http.post(
      `/${accountId}?signature=${sign}`,
      reqPayload
    );
    return data;
  } catch (e) {
    return { signature: '' };
  }
};

const getKey = () => {
  return key;
};

module.exports = {
  getKey,
  verify,
  postRequest,
};
