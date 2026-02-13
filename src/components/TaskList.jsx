import { useState } from 'react';

const PRIORITY_STYLES = {
  high: { className: 'is-error', label: 'HIGH' },
  medium: { className: 'is-warning', label: 'MED' },
  low: { className: 'is-success', label: 'LOW' },
};

const ALL_GROUPS = ['Frontend', 'Backend', 'Testing', 'DevOps', 'Documentation', 'Planning'];

function TaskItem({ task, index, total, onEdit, onMove, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');

  const handleSave = () => {
    onEdit(task.id, { title: editTitle, description: editDesc });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditing(false);
  };

  const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  if (editing) {
    return (
      <div className="nes-container" style={{ marginBottom: '0.5rem', padding: '0.75rem' }}>
        <input
          className="nes-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          style={{ marginBottom: '0.5rem', fontSize: '0.75rem' }}
        />
        <textarea
          className="nes-textarea"
          rows={2}
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}
        />
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="nes-btn is-success" onClick={handleSave} style={{ fontSize: '0.65rem' }}>Save</button>
          <button className="nes-btn" onClick={handleCancel} style={{ fontSize: '0.65rem' }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nes-container" style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <span className={`nes-badge`}>
              <span className={ps.className} style={{ fontSize: '0.5rem' }}>{ps.label}</span>
            </span>
            <span className="nes-badge">
              <span className="is-primary" style={{ fontSize: '0.5rem' }}>{task.group}</span>
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', margin: '0.25rem 0', fontWeight: 'bold' }}>{task.title}</p>
          {task.description && (
            <p style={{ fontSize: '0.65rem', margin: 0, color: '#666' }}>{task.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
          <button className="nes-btn" onClick={() => setEditing(true)} style={{ fontSize: '0.6rem', padding: '2px 6px' }} title="Edit">✎</button>
          <button className="nes-btn" onClick={() => onMove(index, -1)} disabled={index === 0} style={{ fontSize: '0.6rem', padding: '2px 6px' }} title="Move up">▲</button>
          <button className="nes-btn" onClick={() => onMove(index, 1)} disabled={index === total - 1} style={{ fontSize: '0.6rem', padding: '2px 6px' }} title="Move down">▼</button>
          <button className="nes-btn is-error" onClick={() => onRemove(task.id)} style={{ fontSize: '0.6rem', padding: '2px 6px' }} title="Remove">✕</button>
        </div>
      </div>
    </div>
  );
}

export default function TaskList({ spec, onUpdateSpec }) {
  const [groupBy, setGroupBy] = useState(false);

  if (!spec) return null;

  const handleEditTask = (taskId, updates) => {
    onUpdateSpec({
      ...spec,
      tasks: spec.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
    });
  };

  const handleMoveTask = (index, direction) => {
    const tasks = [...spec.tasks];
    const target = index + direction;
    if (target < 0 || target >= tasks.length) return;
    [tasks[index], tasks[target]] = [tasks[target], tasks[index]];
    onUpdateSpec({ ...spec, tasks });
  };

  const handleRemoveTask = (taskId) => {
    onUpdateSpec({
      ...spec,
      tasks: spec.tasks.filter(t => t.id !== taskId),
    });
  };

  const handleEditStory = (storyId, newStory) => {
    onUpdateSpec({
      ...spec,
      userStories: spec.userStories.map(s => s.id === storyId ? { ...s, story: newStory } : s),
    });
  };

  const handleRemoveStory = (storyId) => {
    onUpdateSpec({
      ...spec,
      userStories: spec.userStories.filter(s => s.id !== storyId),
    });
  };

  const groupedTasks = groupBy
    ? ALL_GROUPS.reduce((acc, group) => {
        const items = spec.tasks.filter(t => t.group === group);
        if (items.length > 0) acc[group] = items;
        return acc;
      }, {})
    : null;

  return (
    <div>
      {/* User Stories */}
      <section className="nes-container with-title" style={{ marginBottom: '1.5rem' }}>
        <p className="title">User Stories ({spec.userStories.length})</p>
        {spec.userStories.map((us) => (
          <UserStoryItem
            key={us.id}
            story={us}
            onEdit={handleEditStory}
            onRemove={handleRemoveStory}
          />
        ))}
      </section>

      {/* Tasks */}
      <section className="nes-container with-title" style={{ marginBottom: '1.5rem' }}>
        <p className="title">Engineering Tasks ({spec.tasks.length})</p>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.7rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              className="nes-checkbox"
              checked={groupBy}
              onChange={(e) => setGroupBy(e.target.checked)}
            />
            <span style={{ marginLeft: '0.5rem' }}>Group by category</span>
          </label>
        </div>

        {groupBy ? (
          Object.entries(groupedTasks).map(([group, tasks]) => (
            <div key={group} style={{ marginBottom: '1rem' }}>
              <h4 className="nes-text is-primary" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>{group}</h4>
              {tasks.map((task) => {
                const globalIndex = spec.tasks.indexOf(task);
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={globalIndex}
                    total={spec.tasks.length}
                    onEdit={handleEditTask}
                    onMove={handleMoveTask}
                    onRemove={handleRemoveTask}
                  />
                );
              })}
            </div>
          ))
        ) : (
          spec.tasks.map((task, i) => (
            <TaskItem
              key={task.id}
              task={task}
              index={i}
              total={spec.tasks.length}
              onEdit={handleEditTask}
              onMove={handleMoveTask}
              onRemove={handleRemoveTask}
            />
          ))
        )}
      </section>
    </div>
  );
}

function UserStoryItem({ story, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(story.story);

  const ps = PRIORITY_STYLES[story.priority] || PRIORITY_STYLES.medium;

  if (editing) {
    return (
      <div className="nes-container" style={{ marginBottom: '0.5rem', padding: '0.5rem' }}>
        <textarea
          className="nes-textarea"
          rows={2}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}
        />
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="nes-btn is-success" onClick={() => { onEdit(story.id, editText); setEditing(false); }} style={{ fontSize: '0.65rem' }}>Save</button>
          <button className="nes-btn" onClick={() => { setEditText(story.story); setEditing(false); }} style={{ fontSize: '0.65rem' }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nes-container" style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="nes-badge" style={{ marginRight: '0.5rem' }}>
          <span className={ps.className} style={{ fontSize: '0.5rem' }}>{ps.label}</span>
        </span>
        <span style={{ fontSize: '0.7rem' }}>{story.story}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
        <button className="nes-btn" onClick={() => setEditing(true)} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>✎</button>
        <button className="nes-btn is-error" onClick={() => onRemove(story.id)} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>✕</button>
      </div>
    </div>
  );
}
