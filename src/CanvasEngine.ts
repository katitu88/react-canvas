import { AbstractElementFactory } from "./AbstractElementFactory";
import { SquareElementFactory } from "./primitives/square/SquareElementFactory";
import { CanvasElementModel } from "./models-canvas/CanvasElementModel";
import { CanvasModel } from "./models-canvas/CanvasModel";
import { CanvasWidget } from "./widgets/CanvasWidget";
import { SelectionElementFactory } from "./primitives/selection/SelectionElementFactory";
import { StateMachine } from "./state-machine/StateMachine";
import { TranslateCanvasState } from "./states/TranslateCanvasState";
import { ZoomCanvasState } from "./states/ZoomCanvasState";
import * as _ from "lodash";

export class CanvasEngineError extends Error {}

export class CanvasEngine {
	protected elementFactories: { [type: string]: AbstractElementFactory };
	protected model: CanvasModel;
	protected stateMachine: StateMachine;
	protected canvasWidget;

	constructor() {
		this.elementFactories = {};
		this.model = null;
		this.canvasWidget = null;
		this.stateMachine = new StateMachine();
	}

	getStateMachine(): StateMachine {
		return this.stateMachine;
	}

	setModel(model: CanvasModel) {
		this.model = model;
	}

	getModel(): CanvasModel {
		return this.model;
	}

	registerElementFactory(factory: AbstractElementFactory) {
		this.elementFactories[factory.type] = factory;
		factory.setEngine(this);
		_.forEach(factory.getCanvasStates(), state => {
			this.stateMachine.addState(state);
		});
	}

	installDefaults() {
		this.registerElementFactory(new SquareElementFactory());
		this.registerElementFactory(new SelectionElementFactory());
		this.stateMachine.addState(new TranslateCanvasState(this));
		this.stateMachine.addState(new ZoomCanvasState(this));
	}

	getCanvasWidget(): CanvasWidget {
		return this.canvasWidget;
	}

	setCanvasWidget(widget: CanvasWidget) {
		this.canvasWidget = widget;
	}

	getFactoryForElement(element: CanvasElementModel): AbstractElementFactory {
		if (!this.elementFactories[element.type]) {
			throw new CanvasEngineError("Cannot find Element factory with name: " + element.type);
		}
		return this.elementFactories[element.type];
	}
}
