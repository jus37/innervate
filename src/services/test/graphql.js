import {oncePerServices, missingService} from '../../common/services/index'

const PREFIX = '';

export default oncePerServices(function (services) {
  
  const graphqlBuilderSchema = require('../../common/graphql/LevelBuilder.schema');
  
  const resolvers = require('./resolvers').default(services);
  
  return async function builder(args) {
    
    graphqlBuilderSchema.build_options(args);
    const { parentLevelBuilder, typeDefs, builderContext } = args;
    
    typeDefs.push(`
      type ${PREFIX}TestQueryObject {
        a: String,
        b: String
      }
    
      type ${PREFIX}TestQueryElement {
        str: String,
        int: Int,
        obj: ${PREFIX}TestQueryObject
      }
      
    `);
    
    parentLevelBuilder.addQuery({
      name: `testQuery`,
      type: `[${PREFIX}TestQueryElement]`,
      args: `
        str_var: String,
        int_var: Int
      `,
      resolver: resolvers.testQuery(builderContext),
    });

    // Users схема

    typeDefs.push(`
      type ${PREFIX}User {
        user_id: Int,
        login: String,
        name: String,
        email: String,
        manager: Boolean,
        blocked: Boolean,
        birthday: String,
      }
    `);

    parentLevelBuilder.addQuery({
      name: `users`,
      type: `[${PREFIX}User]`,
      args: `
        manager: Boolean,
        blocked: Boolean,
        search: String
      `,
      resolver: resolvers.usersQuery(builderContext),
    });

    //Auth

    typeDefs.push(`
      type ${PREFIX}Auth {
        success: Boolean
      }
    `);

    parentLevelBuilder.addMutation({
      name: `auth`,
      type: `${PREFIX}Auth`,
      args: `
        login: String!,
        password_hash: String!
      `,
      resolver: resolvers.authMutation(builderContext),
    });
    
  }
});
