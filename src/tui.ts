import type { TuiPlugin, TuiPluginModule } from '@opencode-ai/plugin/tui';

export const tui: TuiPlugin = async (api, _options, meta) => {
  api.command.register(() => [
    {
      title: 'Secure MCP setup',
      value: 'secure-mcp-setup',
      description: 'Run the guided /add-secure-mcp workflow',
      category: 'Plugins',
      onSelect: () => {
        api.command.trigger('add-secure-mcp');
      },
    },
  ]);

  if (meta.state === 'first') {
    api.ui.toast({
      variant: 'info',
      message: 'openbao-mcp-guard active. Use /add-secure-mcp for secure MCP setup.',
      duration: 5000,
    });
  }
};

const plugin: TuiPluginModule = {
  id: 'openbao-mcp-guard',
  tui,
};

export default plugin;
