if (process.env.NODE_ENV === "local_to_gcp") {
  require('dotenv').config();
}
module.exports = {
  development: {
    username: "root",
    password: "password",
    database: "art_collection",
    host: "127.0.0.1",
    dialect: "mysql",
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_520_ci"
    }
  },
  test: {
    username: "root",
    password: "password",
    database: "art_collection_test_database",
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false
  },
  production: {
    use_env_variable: "CLEARDB_DATABASE_URL",
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_520_ci"
    }
  },
  local_to_gcp: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.SQL_HOST,
    dialect: "mysql",
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_520_ci"
    }
  },
  google_cloud: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    dialect: "mysql",
    dialectOptions: {
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_520_ci"
    }
  }
}
