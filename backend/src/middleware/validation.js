export const validateRequest = (schema) => {
  console.log("middleware check")
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    req.body = value;
    next();
  };
};