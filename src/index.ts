/** @format */

import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers, typeDefs } from '../lib/gql';
import mongoose from 'mongoose';
import { PORT, KEY, NODE_ENV } from './vars';
import helmet from 'helmet';

async function startServer() {
	const app = express.default();
	const apolloServer = new ApolloServer({
		typeDefs: typeDefs,
		resolvers: resolvers,
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({ app, path: '/gql' });

	app.use('/', (req, res) => {
		res.status(200).send(
			`<h1>Welcome to the openPronoun API!</h1> <p>Currently, there is no REST API. Please use GraphQL at <a href="./gql">/gql.</a></p>`
		);
	});

	app.use(helmet());

	app.use((req, res) => {
		res.status(404).send({
			status: res.statusCode,
			message: 'Not Found',
		});
	});

	await mongoose.connect('mongodb://localhost:27017/opd', {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	});
	console.log('Connected to MongoDB');

	app.listen({ port: PORT }, () => {
		console.log(`🚀 Server ready at http://localhost:${PORT}`);
		console.log(
			`🚀 GQL ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
		);
		console.info(`NODE_ENV: ${NODE_ENV}, KEY: ${KEY}`);
	});
}

if (KEY === '0' && NODE_ENV !== 'development') {
	console.error(
		'Running in production mode with KEY set to 0. Please set KEY to a valid value then start again.'
	);
} else {
	startServer();
}
