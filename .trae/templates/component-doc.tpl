/**
 * @description {{component_name}} 组件
 * @project {{project_name}}
 * @version {{version}}
 * @author {{author}}
 * @created {{created_date}}
 */

interface {{ComponentName}}Props {
  {{props}}
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  {{props_destructured}}
}) => {
  return (
    <div className="{{component_name}}-container">
      {{component_body}}
    </div>
  );
};
