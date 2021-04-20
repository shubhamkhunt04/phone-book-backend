const jwt = require('jsonwebtoken');

module.exports.recordOptionsHelper = (req) => {
  console.log(req.query.sort);
  const limit = parseInt(req.query.limit) || null;
  console.log(req.query.sort);

  let sortOptions = {};

  if (req.query.sort) {
    const str = req.query.sort.split(':');
    console.log(str);
    sortOptions[str[0]] = str[1] === 'desc' ? -1 : 1;
    console.log(sortOptions);
  } else {
    sortOptions = { createdAt: 1 };
  }
  console.log('limitfun', limit);
  console.log('sortOptionsfun', sortOptions);
  return { limit, sortOptions };
};
