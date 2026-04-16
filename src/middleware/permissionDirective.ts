import type { App } from 'vue';
import { usePermission } from '../hook/usePermission';

const permissionDirective = {
  install(app: App) {
    app.directive('permission', {
      mounted(el, binding) {
        const { hasPermission } = usePermission();
        const value = binding.value;

        if (!hasPermission(value)) {
          el.parentNode && el.parentNode.removeChild(el);
        }
      },
      updated(el, binding) {
        const { hasPermission } = usePermission();
        const value = binding.value;

        if (!hasPermission(value)) {
          el.parentNode && el.parentNode.removeChild(el);
        }
      }
    });
  }
};

export {
  permissionDirective
}
