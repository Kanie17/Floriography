TavernHelper.registerSlashCommand("flori", "花语集变量管理", (args) => {
    let action = args.named_args.action || args.unnamed_args[0];
    let target = args.named_args.target || args.unnamed_args[1];

    let flori = TavernHelper.getVariable("花语集");
    if (!flori) flori = {};
    if (typeof flori === 'string') {
        try { flori = JSON.parse(flori); } catch(e) { flori = {}; }
    }
    
    if (!flori.角色花语) flori.角色花语 = {};
    if (!flori.札记) flori.札记 = [];

    let updated = false;

    if (action === "assign") {
        if (flori.角色花语[target]) {
            flori.角色花语[target].当前阶段 = 0;
            updated = true;
        }
    } else if (action === "remove") {
        if (flori.角色花语[target]) {
            delete flori.角色花语[target];
            updated = true;
        }
    } else if (action === "journal_add") {
        try {
            let entryStr = decodeURIComponent(escape(atob(target)));
            let entry = JSON.parse(entryStr);
            flori.札记.push(entry);
            updated = true;
        } catch (e) {
            console.error("解析札记失败", e);
        }
    } else if (action === "journal_del") {
        let idx = parseInt(target);
        if (!isNaN(idx) && idx >= 0 && idx < flori.札记.length) {
            flori.札记.splice(idx, 1);
            updated = true;
        }
    }

    if (updated) {
        TavernHelper.setVariable("花语集", flori);
        return "success";
    }
    return "failed";
}, [
    TavernHelper.makeArgument("action", "操作类型 (assign/remove/journal_add/journal_del)", true),
    TavernHelper.makeArgument("target", "目标角色名或Base64数据", true)
]);
