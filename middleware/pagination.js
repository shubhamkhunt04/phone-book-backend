module.exports.paginatedResult = (model, sortFlag = true) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    let sortOptions = {};
    // http://localhost:5000/user/users?sort=username:desc
    if (req.query.sort) {
      const str = req.query.sort.split(':');
      sortOptions[str[0]] = str[1] === 'desc' ? -1 : 1;
    } else {
      sortOptions = { createdAt: 1 };
    }

    const filterOptions = {};
    if (req.query.filter) {
      const str = req.query.filter.split(':');
    }
    const searchOptions = {};
    if (req.query.search) {
      const str = req.query.search.split(':');
      searchOptions[str[0]] = { $regex: str[1], $options: '$i' };
    }

    const startIndex = (page - 1) * limit;

    try {
      let results;
      if (sortFlag) {
        results = await model
          .find(searchOptions)
          .limit(limit)
          .skip(startIndex)
          .sort(sortOptions)
          .exec();
      } else {
        results = await model.find().limit(limit).skip(startIndex).exec();
      }
      // get total documents in the collection
      const count = await model.countDocuments();
      // res.json({
      //   results,
      //   totalPages: Math.ceil(count / limit),
      //   currentPage: page,
      // });
      next();
    } catch (err) {
      res.json({ message: err.message });
    }
  };
};
