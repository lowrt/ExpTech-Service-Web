export class ElementBuilder {
	constructor(data = {}) {
		if (typeof data == "string") {
			this.element = document.createElement(data);
		} else {
			this.element = document.createElement(data.tag ?? "div");

			if ("id" in data)
				this.element.id = data.id;

			if ("class" in data)
				if (Array.isArray(data.class))
					for (const className of data.class)
						this.element.classList.add(className);
				else if (typeof data.class == "string")
					this.element.className = data.class;

			if ("attributes" in data)
				for (const key in data.attributes)
					this.element.setAttribute(key, data.attributes[key]);
		}
	}

	setId(id) {
		this.element.id = id;
		return this;
	}

  setClass(data) {
    if (Array.isArray(data))
      for (const className of data)
        this.element.classList.add(className);
    else if (typeof data == "string")
      this.element.className = data;
      return this;
  }

	setContent(content) {
		this.element.textContent = content;
		return this;
	}

	setAttribute(key, value) {
		this.element.setAttribute(key, value);
		return this;
	}

	setDisabled(state) {
		this.element.disabled = state;
		return this;
	}

	setRequired(required) {
		this.element.required = required;
		return this;
	}

	addChildren(children) {
		if (children instanceof ElementBuilder)
			if (Array.isArray(children))
				this.element.append(...children.map(v => v.toElement()));
			else
				this.element.append(children.toElement());
		else if (Array.isArray(children))
			this.element.append(...children);
		else
			this.element.append(children);

		return this;
	}

	setChildren(children) {
		this.element.setChildren(children);
	}

	on(eventName, callback, ...args) {
		this.element.addEventListener(eventName, callback.bind(this.element, ...args));
		return this;
	}

	once(eventName, callback, ...args) {
		this.element.addEventListener(eventName, callback.bind(this.element, ...args), { once: true });
		return this;
	}

	toElement() {
		return this.element;
	}
}