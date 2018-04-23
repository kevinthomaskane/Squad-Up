module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING
    },
    image: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    skill_level: DataTypes.INTEGER,
    address: DataTypes.INTEGER,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.INTEGER
  });

  User.associate = function(models) {
    const Even = models.Event
    User.belongsToMany(Even, {
      through: "Host",
      foreignKey: "userId"
    });
    User.belongsToMany(Even, {
      through: "Attendee",
      foreignKey: "userId"
    });
  };
  return User;
};