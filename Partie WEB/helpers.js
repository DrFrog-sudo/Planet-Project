function formatSpeed(h) {
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'}`;
    if (h < 168) return `${(h / 24).toFixed(1)} days`;
    if (h < 720) return `${(h / 168).toFixed(1)} weeks`;
    return `${(h / 720).toFixed(1)} months`;
}

function formatElapsed(h) {
    if (h < 24) return `${floor(h)}h`;
    if (h < 168) return `${floor(h / 24)}d ${floor(h % 24)}h`;
    if (h < 720) return `${floor(h / 168)}w ${floor(h % 168 / 24)}d`;
    if (h < 8760) return `${floor(h / 720)}mo ${floor(h % 720 / 168)}w`;
    return `${floor(h / 8760)}y ${floor(h % 8760 / 720)}mo`;
}