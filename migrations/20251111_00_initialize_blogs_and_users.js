const { DataTypes } = require('sequelize')

module.exports = {
    up: async ({ context: queryInterface }) => {
        await queryInterface.createTable('blogs', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            author: {
                type: DataTypes.STRING
            },
            url: {
                type: DataTypes.STRING,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            year: {
                type: DataTypes.INTEGER,
                validate: {
                    min: 1991,
                    max: new Date().getFullYear()
                }
            },
            likes: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE
        })

        await queryInterface.createTable('users', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
                validate: {
                isEmail: true
                }
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE
        })
        await queryInterface.addColumn('blogs', 'user_id', {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        })
    },
    down: async ({ context: queryInterface }) => {
        await queryInterface.dropTable('blogs')
        await queryInterface.dropTable('users')
    },
}
