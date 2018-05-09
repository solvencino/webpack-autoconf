import React from 'react';
import { render } from 'react-dom';
import jsStringify from "javascript-stringify";
import _ from "lodash";
import { features, createWebpackConfig, createBabelConfig, getNpmDependencies } from "./src/configurator";

import prism from "prismjs";

const Feature = ({feature, selected, setSelected}) => (
    <label key={feature} className="feature-container">
            {feature}
            <input
                checked={selected}
                onClick={() => setSelected(feature)}
                type="checkbox" />
                <span className="checkmark"></span>
    </label>
);

class Features extends React.Component {
    render() {
        const { features, selected, setSelected } = this.props;
        const groupedFeatures = _.chain(features)
              .mapValues((v,k,o) => Object.assign({}, v, { feature: k }))
              .groupBy("group")
              .value();

        return (
            <div className="features">
                {_.map(groupedFeatures, (featureList, group) => (
                    <div className="feature-group">
                        <div className="feature-group-name">
                            {group !== "undefined" ? group : ""}
                        </div>
                        <div className="feature-group-container">
                        {_.map(featureList, (feature) => (
                            <Feature
                                feature={feature.feature}
                                selected={selected[feature.feature]}
                                setSelected={setSelected}
                            />
                        ))}
                    </div>
                    </div>
                ))}

            </div>
        );
    }
}

const logFeatureClickToGa = (feature, selected) => {
    const eventAction = selected ? 'select' : 'deselect';
    window.gtag("event", eventAction, {
        "event_category": "features",
        "event_label": feature
    })
}

class Configurator extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selected: { } }
        this.setSelected = this.setSelected.bind(this);
    }
    setSelected(feature) {
        logFeatureClickToGa(feature, !this.state.selected[feature]);
        const selected = Object.assign({}, this.state.selected, { [feature]: !this.state.selected[feature] })
        this.setState({ selected });
    }
    selectedArray(){
        return _.chain(this.state.selected).map((v, k) => v ? k : null).reject(_.isNull).value();
    }
    render() {
        const newWebpackConfig = createWebpackConfig(this.selectedArray());
        const newBabelConfig = createBabelConfig(this.selectedArray());
        const newNpmConfig = getNpmDependencies(this.selectedArray());

        const highlightedWebpackConfig = () => {
            return {
                __html: Prism.highlight(newWebpackConfig, Prism.languages.javascript, 'javascript')
            };
        };

        const npmInstallCommand = _.isEmpty(newNpmConfig.dependencies) ? "" : "\nnpm install " + newNpmConfig.dependencies.join(" ")
        const npmCommand = "mkdir myapp\ncd myapp\nnpm init -y\nnpm install --save-dev " + newNpmConfig.devDependencies.join(" ") + npmInstallCommand

        return (
            <div>
                <div className="header">
                    <h1>webpack 4 configurator</h1>
                    <h2>Create a <i>personalized</i> and <i>optimized</i> webpack.config.js!</h2>

                    <div >
                        <div className="start-here">Start here! What features do you need?</div>
                    </div>
                    <Features
                        features={features}
                        selected={this.state.selected}
                        setSelected={this.setSelected}/>
                </div>
                <div className="container">
                    <div className="left-section">
                        <h3>Your personal webpack.config.js</h3>
                        <pre><code className="language-css" dangerouslySetInnerHTML={highlightedWebpackConfig()}></code></pre>
                    </div>
                    <div className="right-section">
                        <h3>Create your project in {newBabelConfig ? 4 : 3} easy steps!</h3>
                        <ol>
                        <li>Create an NPM project and install dependencies</li>
                        <textarea readOnly={true} rows="6" cols="50" value={npmCommand}/>

                        <li>Create webpack.config.js in the root and copy the contents of the generated file</li>

                        <li>Create folders src and dist and create your index.js file in src folder</li>
                        {newBabelConfig ? <div><li>You will also need this .babelrc file</li>
                            <textarea readOnly={true} rows="11" cols="50" value={newBabelConfig}/></div> : null}

                        </ol>
                        <a href="http://blog.jakoblind.no/react-with-webpack-babel-npm/">Need more detailed instructions?</a>
                    </div>
                </div>

                <div className="footer">
                    <h3>What is this?  </h3>
                    <p>
                        When using this tool, you get a webpack.config.js that is created just for <i>you</i>. It's a great starting point for further development. The webpack.config.js will create an optimized bundle based on <a href="http://blog.jakoblind.no/3-ways-to-reduce-webpack-bundle-size/">best practices</a>. Advanced optimizations such as code splitting is not (yet?) supported with this tool.
                    </p>
                    <h4>Want more?</h4>
                    <p>Want to be notified when I build more cool stuff like this? And also get early access to articles?</p>
                    <a className="myButton" href="https://www.getdrip.com/forms/81916834/submissions/new">Sign up to my newsletter</a>
                    <h4>Found a bug or want a feature?</h4>
                    <p>Contact me on <a href="https://twitter.com/karljakoblind">twitter</a> or file an issue or even better make a PR on the <a href="https://github.com/jakoblind/webpack-configurator">github repo</a>. Yes this is open source.</p>
                    <h4>Who made this thing?</h4>
                    <p>
                        It's me, Jakob who made this. I write <a href="http://blog.jakoblind.no">a blog about React</a> that you might want to check out if you liked this! I am also on <a href="https://twitter.com/karljakoblind">twitter</a>.
                    </p>

                </div>

            </div>)

    }
}

const App = () => (
    <Configurator />
);

render(<App />, document.getElementById('app'));
