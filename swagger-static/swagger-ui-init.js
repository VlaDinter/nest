
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api": {
        "get": {
          "operationId": "AppController_getHello",
          "summary": "Home",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "tags": [
            "App"
          ]
        }
      },
      "/api/testing/all-data": {
        "delete": {
          "operationId": "TestingController_deleteAllData",
          "summary": "Delete all data",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Testing"
          ]
        }
      },
      "/api/auth/me": {
        "get": {
          "operationId": "AuthController_getMe",
          "summary": "Get info about current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "The found record",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/MeViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/auth/login": {
        "post": {
          "operationId": "AuthController_postLogin",
          "summary": "Post login",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "loginOrEmail": {
                      "type": "string",
                      "example": "login123"
                    },
                    "password": {
                      "type": "string",
                      "example": "superpassword"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LoginSuccessViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_postRefreshToken",
          "summary": "Post refresh token",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LoginSuccessViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/registration": {
        "post": {
          "operationId": "AuthController_postRegistration",
          "summary": "Post registration",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_postRegistrationEmailResending",
          "summary": "Post registration email resending",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailConfirmationInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_postRegistrationConfirmation",
          "summary": "Post registration confirmation",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationConfirmationCodeInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_postPasswordRecovery",
          "summary": "Post password recovery",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailConfirmationInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/new-password": {
        "post": {
          "operationId": "AuthController_postNewPassword",
          "summary": "Post new password",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/NewPasswordRecoveryInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/logout": {
        "post": {
          "operationId": "AuthController_postLogout",
          "summary": "Post logout",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/sa/users": {
        "get": {
          "operationId": "UsersController_getUsers",
          "summary": "Get users",
          "parameters": [
            {
              "name": "searchLoginTerm",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "searchEmailTerm",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Users"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        },
        "post": {
          "operationId": "UsersController_postUsers",
          "summary": "Post users",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserInputModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Users"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/sa/users/{id}": {
        "delete": {
          "operationId": "UsersController_deleteUser",
          "summary": "Delete user",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Users"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/blogs": {
        "get": {
          "operationId": "BlogsController_getBlogs",
          "summary": "Get blogs",
          "parameters": [
            {
              "name": "searchNameTerm",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        },
        "post": {
          "operationId": "BlogsController_postBlogs",
          "summary": "Post blogs",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogInputModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BlogViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Blogs"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/blogs/{id}": {
        "get": {
          "operationId": "BlogsController_getBlog",
          "summary": "Get blog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          },
          "tags": [
            "Blogs"
          ]
        },
        "put": {
          "operationId": "BlogsController_putBlog",
          "summary": "Put blog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        },
        "delete": {
          "operationId": "BlogsController_deleteBlog",
          "summary": "Delete blog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/blogs/{id}/posts": {
        "get": {
          "operationId": "BlogsController_getPosts",
          "summary": "Get posts",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        },
        "post": {
          "operationId": "BlogsController_postPosts",
          "summary": "Post posts",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogPostInputModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Blogs"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "BlogsController_putPosts",
          "summary": "Put posts",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogPostInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        },
        "delete": {
          "operationId": "BlogsController_deletePost",
          "summary": "Delete post",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/posts": {
        "get": {
          "operationId": "PostsController_getPosts",
          "summary": "Get posts",
          "parameters": [
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostsController_postPosts",
          "summary": "Post posts",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PostInputModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/posts/{id}": {
        "get": {
          "operationId": "PostsController_getPost",
          "summary": "Get post",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "put": {
          "operationId": "PostsController_putPost",
          "summary": "Put post",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PostInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        },
        "delete": {
          "operationId": "PostsController_deletePost",
          "summary": "Delete post",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "basicAuth": []
            }
          ]
        }
      },
      "/api/posts/{id}/like-status": {
        "put": {
          "operationId": "PostsController_putLikeStatus",
          "summary": "Put like status",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/posts/{id}/comments": {
        "get": {
          "operationId": "PostsController_getComments",
          "summary": "Get comments",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pageSize",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "pageNumber",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostsController_postComments",
          "summary": "Post comments",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentInputModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CommentViewModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/comments/{id}": {
        "get": {
          "operationId": "CommentsController_getComment",
          "summary": "Get comment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          },
          "tags": [
            "Comments"
          ]
        },
        "put": {
          "operationId": "CommentsController_putComment",
          "summary": "Put comment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "CommentsController_deleteComment",
          "summary": "Delete comment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/comments/{id}/like-status": {
        "put": {
          "operationId": "CommentsController_putLikeStatus",
          "summary": "Put like status",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/security/devices": {
        "get": {
          "operationId": "DevicesController_getSecurityDevices",
          "summary": "Get security devices",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/DeviceViewModel"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Devices"
          ]
        },
        "delete": {
          "operationId": "DevicesController_deleteSecurityDevices",
          "summary": "Delete security devices",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Devices"
          ]
        }
      },
      "/api/security/devices/{id}": {
        "delete": {
          "operationId": "DevicesController_deleteSecurityDevice",
          "summary": "Delete security device",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Devices"
          ]
        }
      }
    },
    "info": {
      "title": "Examples",
      "description": "The nest api description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "auth",
        "description": ""
      },
      {
        "name": "users",
        "description": ""
      },
      {
        "name": "blogs",
        "description": ""
      },
      {
        "name": "posts",
        "description": ""
      },
      {
        "name": "devices",
        "description": ""
      },
      {
        "name": "comments",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "securitySchemes": {
        "basicAuth": {
          "type": "http",
          "scheme": "basic"
        },
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        }
      },
      "schemas": {
        "MeViewModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string"
            },
            "login": {
              "type": "string"
            },
            "userId": {
              "type": "string"
            }
          },
          "required": [
            "email",
            "login",
            "userId"
          ]
        },
        "LoginSuccessViewModel": {
          "type": "object",
          "properties": {
            "accessToken": {
              "type": "string"
            },
            "refreshToken": {
              "type": "string"
            }
          },
          "required": [
            "accessToken"
          ]
        },
        "UserInputModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "example": "ww@ww.ww"
            },
            "login": {
              "type": "string",
              "example": "dimych"
            },
            "password": {
              "type": "string",
              "minLength": 6,
              "maxLength": 20
            }
          },
          "required": [
            "email",
            "login",
            "password"
          ]
        },
        "EmailConfirmationInputModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "example": "email@gmail.com"
            }
          },
          "required": [
            "email"
          ]
        },
        "RegistrationConfirmationCodeInputModel": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string"
            }
          },
          "required": [
            "code"
          ]
        },
        "NewPasswordRecoveryInputModel": {
          "type": "object",
          "properties": {
            "newPassword": {
              "type": "string",
              "minLength": 6,
              "maxLength": 20
            },
            "recoveryCode": {
              "type": "string"
            }
          },
          "required": [
            "newPassword",
            "recoveryCode"
          ]
        },
        "EmailConfirmationViewModel": {
          "type": "object",
          "properties": {
            "isConfirmed": {
              "type": "boolean"
            },
            "expirationDate": {
              "format": "date-time",
              "type": "string"
            },
            "confirmationCode": {
              "type": "string"
            }
          },
          "required": [
            "isConfirmed",
            "expirationDate",
            "confirmationCode"
          ]
        },
        "UserViewModel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "login": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "createdAt": {
              "type": "string"
            },
            "passwordHash": {
              "type": "string"
            },
            "emailConfirmation": {
              "$ref": "#/components/schemas/EmailConfirmationViewModel"
            }
          },
          "required": [
            "id",
            "login",
            "email",
            "createdAt"
          ]
        },
        "BlogInputModel": {
          "type": "object",
          "properties": {
            "websiteUrl": {
              "type": "string",
              "maxLength": 100,
              "example": "https://exemple.com"
            },
            "name": {
              "type": "string",
              "maxLength": 15
            },
            "description": {
              "type": "string",
              "maxLength": 500
            }
          },
          "required": [
            "websiteUrl",
            "name",
            "description"
          ]
        },
        "BlogViewModel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "createdAt": {
              "type": "string"
            },
            "websiteUrl": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "isMembership": {
              "type": "boolean"
            }
          },
          "required": [
            "id",
            "name",
            "createdAt",
            "websiteUrl",
            "description",
            "isMembership"
          ]
        },
        "BlogPostInputModel": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "maxLength": 30
            },
            "shortDescription": {
              "type": "string",
              "maxLength": 100
            },
            "content": {
              "type": "string",
              "maxLength": 1000
            }
          },
          "required": [
            "title",
            "shortDescription",
            "content"
          ]
        },
        "LikeDetailsViewModel": {
          "type": "object",
          "properties": {
            "login": {
              "type": "string"
            },
            "userId": {
              "type": "string"
            },
            "addedAt": {
              "type": "string"
            }
          },
          "required": [
            "login",
            "userId",
            "addedAt"
          ]
        },
        "ExtendedLikesInfoViewModel": {
          "type": "object",
          "properties": {
            "myStatus": {
              "type": "string"
            },
            "likesCount": {
              "type": "number"
            },
            "dislikesCount": {
              "type": "number"
            },
            "newestLikes": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LikeDetailsViewModel"
              }
            }
          },
          "required": [
            "myStatus",
            "likesCount",
            "dislikesCount",
            "newestLikes"
          ]
        },
        "PostViewModel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "blogId": {
              "type": "string"
            },
            "content": {
              "type": "string"
            },
            "blogName": {
              "type": "string"
            },
            "createdAt": {
              "type": "string"
            },
            "shortDescription": {
              "type": "string"
            },
            "likes": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LikeDetailsViewModel"
              }
            },
            "dislikes": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LikeDetailsViewModel"
              }
            },
            "extendedLikesInfo": {
              "$ref": "#/components/schemas/ExtendedLikesInfoViewModel"
            }
          },
          "required": [
            "id",
            "title",
            "blogId",
            "content",
            "blogName",
            "createdAt",
            "shortDescription",
            "extendedLikesInfo"
          ]
        },
        "PostInputModel": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "maxLength": 30
            },
            "shortDescription": {
              "type": "string",
              "maxLength": 100
            },
            "content": {
              "type": "string",
              "maxLength": 1000
            },
            "blogId": {
              "type": "string"
            }
          },
          "required": [
            "title",
            "shortDescription",
            "content",
            "blogId"
          ]
        },
        "LikeInputModel": {
          "type": "object",
          "properties": {
            "likeStatus": {
              "enum": [
                "None",
                "Like",
                "Dislike"
              ],
              "type": "string",
              "example": "None, Like, Dislike"
            }
          },
          "required": [
            "likeStatus"
          ]
        },
        "CommentInputModel": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "minLength": 20,
              "maxLength": 300
            }
          },
          "required": [
            "content"
          ]
        },
        "LikesInfoViewModel": {
          "type": "object",
          "properties": {
            "myStatus": {
              "type": "string"
            },
            "likesCount": {
              "type": "number"
            },
            "dislikesCount": {
              "type": "number"
            }
          },
          "required": [
            "myStatus",
            "likesCount",
            "dislikesCount"
          ]
        },
        "CommentatorInfoViewModel": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string"
            },
            "userLogin": {
              "type": "string"
            }
          },
          "required": [
            "userId",
            "userLogin"
          ]
        },
        "CommentViewModel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "postId": {
              "type": "string"
            },
            "content": {
              "type": "string"
            },
            "createdAt": {
              "type": "string"
            },
            "likesInfo": {
              "$ref": "#/components/schemas/LikesInfoViewModel"
            },
            "likes": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LikeDetailsViewModel"
              }
            },
            "dislikes": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/LikeDetailsViewModel"
              }
            },
            "commentatorInfo": {
              "$ref": "#/components/schemas/CommentatorInfoViewModel"
            }
          },
          "required": [
            "id",
            "content",
            "createdAt",
            "likesInfo",
            "commentatorInfo"
          ]
        },
        "DeviceViewModel": {
          "type": "object",
          "properties": {
            "ip": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "deviceId": {
              "type": "string"
            },
            "lastActiveDate": {
              "type": "string"
            }
          },
          "required": [
            "ip",
            "title",
            "deviceId",
            "lastActiveDate"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
