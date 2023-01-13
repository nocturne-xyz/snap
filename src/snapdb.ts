import { InMemoryKVStore, KV, KVStore } from "@nocturne-xyz/sdk";

export class SnapKvStore implements KVStore {
  async getState(): Promise<InMemoryKVStore> {
    const kv = new InMemoryKVStore();
    const maybeState = await wallet.request({
      method: "snap_manageState",
      params: ["get"],
    });
    kv.loadFromDump(maybeState as Record<string, any>);
    return kv;
  }

  async flushToDisk(kv: InMemoryKVStore): Promise<boolean> {
    const state = await kv.dump();
    await wallet.request({
      method: "snap_manageState",
      params: ["update", state],
    });
    return true;
  }

  async getString(key: string): Promise<string | undefined> {
    const kv = await this.getState();
    return kv.getString(key);
  }

  async putString(key: string, value: string): Promise<boolean> {
    const kv = await this.getState();
    kv.putString(key, value);
    await this.flushToDisk(kv);
    return true;
  }

  async remove(key: string): Promise<boolean> {
    const kv = await this.getState();
    kv.remove(key);
    await this.flushToDisk(kv);
    return true;
  }

  async containsKey(key: string): Promise<boolean> {
    const kv = await this.getState();
    return kv.containsKey(key);
  }

  async getNumber(key: string): Promise<number | undefined> {
    const kv = await this.getState();
    return kv.getNumber(key);
  }

  async putNumber(key: string, value: number): Promise<boolean> {
    const kv = await this.getState();
    kv.putNumber(key, value);
    await this.flushToDisk(kv);
    return true;
  }

  async getBigInt(key: string): Promise<bigint | undefined> {
    const kv = await this.getState();
    return kv.getBigInt(key);
  }

  async putBigInt(key: string, value: bigint): Promise<boolean> {
    const kv = await this.getState();
    kv.putBigInt(key, value);
    await this.flushToDisk(kv);
    return true;
  }

  async iterRange(
    startKey: string,
    endKey: string
  ): Promise<AsyncIterable<KV>> {
    const kv = await this.getState();
    return kv.iterRange(startKey, endKey);
  }

  async iterPrefix(prefix: string): Promise<AsyncIterable<KV>> {
    const kv = await this.getState();
    return kv.iterPrefix(prefix);
  }

  async putMany(kvs: KV[]): Promise<boolean> {
    const kv = await this.getState();
    kv.putMany(kvs);
    await this.flushToDisk(kv);
    return true;
  }

  async clear(): Promise<void> {
    const kv = new InMemoryKVStore();
    await this.flushToDisk(kv);
  }

  async close(): Promise<void> {
    return new Promise(() => {});
  }
}
