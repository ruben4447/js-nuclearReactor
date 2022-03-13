const uuid = require('uuid');

const authorisation = (function () {
  let map = new Map();
  return {
    create: function (username) {
      const id = uuid.v4();
      map.set(id, username);
      console.log(`[AUTH]  Create token ${id} for "${username}"`);
      return id;
    },
    remove: function (id) {
      console.log(`[AUTH]  Remove token ${id} (belonged to "${map.get(id)}")`);
      return map.delete(id);
    },
    exists: (id) => map.has(id),
    get: function (id) {
      return map.get(id);
    }
  };
})();

module.exports = authorisation;