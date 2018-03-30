import { StateMachineInput } from "./StateMachineInput";
import { AbstractState } from "./AbstractState";
import * as _ from "lodash";

export class StateMachine {
	inputs: { [name: string]: StateMachineInput };
	states: AbstractState[];
	state: AbstractState;

	constructor() {
		this.inputs = {};
		this.states = [];
		this.state = null;
	}

	addState(state: AbstractState) {
		this.states.push(state);
	}

	removeInput(type: string) {
		if (!this.inputs[type]) {
			return;
		}

		//cant delete locked inputs
		if (this.inputs[type].locked) {
			return;
		}

		delete this.inputs[type];
		this.process();
	}

	addInput(input: StateMachineInput): StateMachineInput {
		this.inputs[input.name] = input;
		this.process();
		return input;
	}

	getInput(name: string): StateMachineInput {
		return _.find(this.inputs, { name: name });
	}

	clearState() {
		if (this.state) {
			this.state.deactivate(this);
		}
		this.state = null;
	}

	setState(state: AbstractState) {
		// deactivate previous state
		if (this.state && state) {
			if (this.state.name !== state.name) {
				this.state.deactivate(this);
				this.state = state;
				state.activated(this);
			} else {
				this.state = state;
				state.process(this);
			}
		} else {
			// there never was a state
			this.state = state;
			state.activated(this);
		}
	}

	process() {
		let foundState = _.some(this.states, state => {
			if (state.shouldStateActivate(this)) {
				this.setState(state);
				return true;
			}
		});
		if (!foundState) {
			this.clearState();
		}

		let reProcess = false;
		_.forEach(this.inputs, input => {
			if (input.ejected) {
				reProcess = true;
				delete this.inputs[input.name];
			}
		});
		if (reProcess) {
			this.process();
		}
	}
}
