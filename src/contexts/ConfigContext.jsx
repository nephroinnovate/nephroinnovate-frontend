import PropTypes from 'prop-types';
import { createContext } from 'react';

// project imports
import defaultConfig from 'config';
import useLocalStorage from 'hooks/useLocalStorage';

// initial state
const initialState = {
  ...defaultConfig,
  onChangeFontFamily: () => {},
  onChangeBorderRadius: () => {},
  onChangeMode: () => {},
  onReset: () => {}
};

// ==============================|| CONFIG CONTEXT & PROVIDER ||============================== //

const ConfigContext = createContext(initialState);

function ConfigProvider({ children }) {
  const [config, setConfig] = useLocalStorage('berry-config-vite-ts', {
    fontFamily: initialState.fontFamily,
    borderRadius: initialState.borderRadius,
    mode: initialState.mode,
    presetColor: initialState.presetColor
  });

  const onChangeFontFamily = (fontFamily) => {
    setConfig({
      ...config,
      fontFamily
    });
  };

  const onChangeBorderRadius = (event, newValue) => {
    setConfig({
      ...config,
      borderRadius: newValue
    });
  };

  const onChangeMode = (mode) => {
    setConfig({
      ...config,
      mode
    });
  };

  const onReset = () => {
    setConfig({ ...defaultConfig });
  };

  return (
    <ConfigContext.Provider
      value={{
        ...config,
        onChangeFontFamily,
        onChangeBorderRadius,
        onChangeMode,
        onReset
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export { ConfigProvider, ConfigContext };

ConfigProvider.propTypes = { children: PropTypes.node };
