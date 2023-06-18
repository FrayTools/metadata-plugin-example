import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import FrayToolsPluginCore.js and BaseMetadataDefinitionPlugin.js
import FrayToolsPluginCore from '@fraytools/plugin-core';
import BaseMetadataDefinitionPlugin from '@fraytools/plugin-core/lib/base/BaseMetadataDefinitionPlugin';

/**
 * Example view for the metadata definition plugin.
 * Note: Types plugins run hidden in the background and thus will not be visible.
 */
class MyMetadataDefinitionPlugin extends BaseMetadataDefinitionPlugin {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  /**
   * Force this component to re-render when parent window sends new props
   */
  onPropsUpdated(props) {
    ReactDOM.render(<MyMetadataDefinitionPlugin {...props} />, document.querySelector('.MyMetadataDefinitionPluginPluginWrapper'));
  }

  /**
   * Send metadata definition collection data here. This function will be called automatically when a 'getMetadataDefinitionConfig' message is received via postMessage().
   * @returns 
   */
  onMetadataDefinitionRequest() {
    // Return metadata definitions
    FrayToolsPluginCore.sendMetadataDefinitions([
      {
        metadataOwnerTypes: ['IMAGE_LAYER_METADATA', 'IMAGE_KEYFRAME_METADATA', 'IMAGE_SYMBOL_METADATA'],
        fields: [{
          name: 'myCustomDropdown',
          label: 'My Custom Dropdown',
          type: 'DROPDOWN',
          defaultValue: null,
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
            { label: 'Option 3', value: 3 }
          ],
          dependsOn: []
        },{
          name: 'myCustomBoolean',
          label: 'My Custom Boolean',
          type: 'BOOLEAN',
          defaultValue: false,
          dependsOn: []
        },{
          name: 'myCustomTags',
          label: 'My Custom Tags',
          type: 'TAGS',
          defaultValue: [],
          dependsOn: [{
            inputField: 'pluginMetadata[].myCustomDropdown',
            operator: '=',
            inputValue: 2
          }]
        }],
        effects: []
      },
      {
        metadataOwnerTypes: ['FRAME_SCRIPT_KEYFRAME_METADATA'],
        fields: [{
          name: 'myCustomDropdown',
          label: 'My Custom Dropdown',
          type: 'DROPDOWN',
          defaultValue: null,
          options: [
            { label: 'n/a', value: null },
            { label: 'Write Hello World', value: 'bar' }
          ],
        }],
        effects: [{
          outputField: 'code',
          outputValue: '// Hello world!', // Replace frame scripts on the current keyframe with this string if conditions are met
          dependsOn: [{
            inputField: 'pluginMetadata[].myCustomDropdown', // Note: '[]' is auto-replaced with current plugin id. You could also use '["my.example.metadata.definition.plugin"]', or even other plugin ids.
            operator: '=',
            inputValue: 'bar',
          }]
        }]
      }
    ]);
  }
  /**
   * Send fields to overwrite metadata on the current asset. 
   */
  onAssetMetadataMigrationRequest() {
    var tags = this.props.assetMetadata.tags;
    // We will add a custom tag to the asset using a migration.
    if (this.props.assetMetadata.tags.indexOf('custom') < 0) {
      tags.push('custom');
    } else {
      // Pass null to inform FrayTools no migration is required
      FrayToolsPluginCore.sendAssetMetadataMigrations(null);
      return;
    }
    FrayToolsPluginCore.sendAssetMetadataMigrations({
      tags: tags
    });
  }

  render() {
    if (this.props.configMode) {
      // If configMode is enabled, display a different view specifically for configuring the plugin
      return (
        <div style={{ color: '#ffffff', background: '#000000' }}>
          <p>{JSON.stringify(MANIFEST_JSON)}</p>
          <p>Hello world! This is an example configuration view for a Metadata Definition plugin.</p>
          <p>Here you would provide a UI for assigning custom settings to persist between sessions using 'pluginConfigSyncRequest' postMessage() commands sent to the parent window. This data will then be stored within the current FrayTools project settings file.</p>
        </div>
      );
    }

    // Note: MetadataDefinitionPlugins that aren't in config mode run in the background and thus do not display a view while active
    return <div/>;
  }
}

// Informs FrayToolsPluginCore the default config metadata for MyMetadataDefinitionPlugin when it first gets initialized
FrayToolsPluginCore.PLUGIN_CONFIG_METADATA_DEFAULTS = {
  version: MANIFEST_JSON.version
};

FrayToolsPluginCore.migrationHandler = (configMetadata) => {
  // Compare configMetadata.version here with your latest manifest version and perform any necessary migrations for compatibility
};
FrayToolsPluginCore.setupHandler = (props) => {
  // Create a new container for the plugin
  var appContainer = document.createElement('div');
  appContainer.className = 'MyMetadataDefinitionPluginWrapper';
  document.body.appendChild(appContainer);

  // Load the component with its props into the document body
  ReactDOM.render(<MyMetadataDefinitionPlugin {...props}/>, appContainer);
};
