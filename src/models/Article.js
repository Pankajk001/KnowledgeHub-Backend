const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
    },
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  tags: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Associations
Article.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Article, { foreignKey: 'author_id', as: 'articles' });

module.exports = Article;
