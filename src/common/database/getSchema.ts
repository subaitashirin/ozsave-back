import { ModelDefinition } from "@nestjs/mongoose";
import { House, HouseSchema } from "src/modules/house/house.model";
import { SingleCost, SingleCostSchema } from "src/modules/single-cost/single-cost.model";
import { User, UserSchema } from "src/modules/users/user/users.model";

const models = {
	'User': {
		name: User.name,
		schema: UserSchema,
	},

	'House': {
		name: House.name,
		schema: HouseSchema,
	},

	'SingleCost': {
		name: 'SingleCost',
		schema: SingleCostSchema
	}
}

export const getAllSchema = (): ModelDefinition[] => {
	return Object.keys(models).map(model => {
		return {
			name: models[model].name,
			schema: models[model].schema
		}
	})
}