import { ModelDefinition } from "@nestjs/mongoose";
import { HouseCostSchema } from "src/modules/house-cost/house-cost.model";
import { House, HouseSchema } from "src/modules/house/house.model";
import { ItemCostSchema } from "src/modules/item-cost/item-cost.model";
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

	'ItemCost': {
		name: 'ItemCost',
		schema: ItemCostSchema
	},

	'SingleCost': {
		name: 'SingleCost',
		schema: SingleCostSchema
	},

	'HouseCost': {
		name: 'HouseCost',
		schema: HouseCostSchema
	},
}

export const getAllSchema = (): ModelDefinition[] => {
	return Object.keys(models).map(model => {
		return {
			name: models[model].name,
			schema: models[model].schema
		}
	})
}