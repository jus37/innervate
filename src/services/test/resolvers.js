import moment from 'moment';
import crypto from 'crypto';
import {GraphQLError} from 'graphql'
import {oncePerServices, missingService} from '../../common/services/index';

function apolloToRelayResolverAdapter(oldResolver) {
  return function (obj, args, context) {
    return oldResolver(args, context.request);
  }
}

export default oncePerServices(function (services) {
    
    const {
        postgres = missingService('postgres')
    } = services;
  
  function testQuery(builderContext) {
    return async function(obj, args, context) {
      return [
          {str: "A", int: 1, obj: {a: "A1", b: "B1"}},
          {str: "B", int: 2, obj: {a: "A2", b: "B2"}},
          {str: "C", int: 3, obj: {a: "A3", b: "B3"}},
      ];
    }
  }

  function usersQuery(builderContext) {
    return async function(obj, args, context) {
      let statement = `SELECT user_id, login, name, email, manager, blocked, data->'birthday' as birthday FROM users `;
      let params = [];

      if (args.manager) {
        statement += ' WHERE manager = $1';
        params.push(args.manager);
      } else if (args.blocked) {
        statement += ' WHERE blocked = $1';
        params.push(args.blocked);
      } else if (args.search) {
        statement += ` WHERE login LIKE $1 OR name LIKE $1`;
        params.push(`%${args.search}%`);
      }

      const res = await postgres.exec({statement, params});
      return res.rows
    }
  }

  function authMutation(builderContext) {
    return async function(obj, args, context) {
      const statement = 'SELECT user_id FROM users WHERE login = $1 AND password_hash = $2';
      const params = [args.login, args.password_hash];

      const res = await postgres.exec({statement, params});

      if (!res.rows.length)
        throw new GraphQLError("Authorization error");

      return {
        success: !!res.rows.length,
      }
    }
  }

  return {
    testQuery,
    usersQuery,
    authMutation
  }
});
