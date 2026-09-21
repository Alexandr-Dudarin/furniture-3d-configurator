"""Derive preview motion from reviewed door pivots and actual drawer box depths."""
def articulations(contract):
    result = []
    door_labels = {
        'Outer_Left': 'Левая крайняя дверь', 'Center_Left': 'Левая центральная дверь',
        'Center_Right': 'Правая центральная дверь', 'Outer_Right': 'Правая крайняя дверь',
        'Left': 'Левая дверь', 'Right': 'Правая дверь',
    }
    for door in contract.get('doors', []):
        key = door.get('key', door.get('side'))
        result.append(dict(id=door['name'], target=door['name'], label=door_labels[key],
                           kind='door', angle=door['angle']))
    drawers = contract.get('drawers', [])
    columns = sorted(set(d.get('column', 0) for d in drawers))
    for column in columns:
        group = sorted([d for d in drawers if d.get('column', 0) == column],
                       key=lambda d: d.get('row', d['index']), reverse=True)
        for index, drawer in enumerate(group, 1):
            prefix = ('Левый' if column == columns[0] else 'Правый') + ' ящик' if len(columns) > 1 else 'Ящик'
            depth = drawer.get('boxDepth')
            if depth is None:
                name = drawer['name'].replace('_Assembly', '_Bottom')
                part = next(p for p in contract['parts'] if p['name'] == name)
                depth = part['size'][2]
            result.append(dict(id=drawer['name'], target=drawer['name'],
                               label=f'{prefix} {index} сверху', kind='drawer',
                               travel=dict(dimension='depth', baseLength=depth, factor=1, ratio=0.55, max=0.18)))
    return result
