/**
 * 花语集变量结构
 * 注册指令: /flori
 */
TavernHelper.registerSlashCommand("flori", "花语集变量管理", (args) => {
    let action = args.named_args.action || args.unnamed_args[0];
    let target = args.named_args.target || args.unnamed_args[1];
    let dataB64 = args.named_args.data; // 新增：接收从 UI 传来的完整数据

    // 获取整个 stat_data
    let statData = TavernHelper.getVariable("stat_data");
    if (!statData) statData = {};
    if (typeof statData === 'string') {
        try { statData = JSON.parse(statData); } catch(e) { statData = {}; }
    }
    
    if (!statData.花语集) statData.花语集 = {};
    let flori = statData.花语集;
    if (!flori.角色花语) flori.角色花语 = {};
    if (!flori.札记) flori.札记 = [];

    let updated = false;

    if (action === "assign") {
        // 如果 UI 传来了完整数据，直接创建并写入变量
        if (dataB64) {
            try {
                let parsedData = JSON.parse(decodeURIComponent(escape(atob(dataB64))));
                // 如果之前已经有残存数据，保留其忆笺和拾遗
                if (flori.角色花语[target]) {
                    parsedData.忆笺 = flori.角色花语[target].忆笺 || [];
                    parsedData.拾遗 = flori.角色花语[target].拾遗 || [];
                }
                flori.角色花语[target] = parsedData;
                updated = true;
            } catch(e) {
                console.error("解析花语数据失败", e);
            }
        } 
        // 兼容旧逻辑
        else if (flori.角色花语[target]) {
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
        TavernHelper.setVariable("stat_data", statData);
        return "success";
    }
    return "failed";
}, [
    TavernHelper.makeArgument("action", "操作类型 (assign/remove/journal_add/journal_del)", true),
    TavernHelper.makeArgument("target", "目标角色名或Base64数据", true),
    TavernHelper.makeArgument("data", "Base64完整数据(可选)", false)
]);
