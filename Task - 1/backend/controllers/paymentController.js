exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    res.json({
      clientSecret: 'pi_dummy_' + Date.now() + '_secret_dummy',
      dummy: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
