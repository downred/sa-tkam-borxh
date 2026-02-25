
module.exports = {
  apiReference: jest.fn(() => (req, res) => {
    res.status(200).json({ message: 'API Reference Mock' });
  })
};
