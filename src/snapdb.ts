import { InMemoryKVStore, KV, KVStore, thunk, Thunk } from "@nocturne-xyz/core";

const loadKVfromDump = async () => {
  const kv = new InMemoryKVStore();
  const maybeState = await snap.request({
    method: "snap_manageState",
    params: {
      operation: "get",
    },
  });
  await kv.loadFromDump((maybeState as Record<string, any>) ?? {});
  return kv;
};

export class SnapKvStore implements KVStore {
  private kv: Thunk<InMemoryKVStore>;

  constructor() {
    this.kv = thunk(loadKVfromDump);
  }

  async flushToDisk(kv: InMemoryKVStore): Promise<boolean> {
    const state = await kv.dump();
    await snap.request({
      method: "snap_manageState",
      params: {
        operation: "update",
        newState: state,
      },
    });
    return true;
  }

  async getString(key: string): Promise<string | undefined> {
    const kv = await this.kv();
    return kv.getString(key);
  }

  async putString(key: string, value: string): Promise<boolean> {
    const kv = await this.kv();
    await kv.putString(key, value);
    await this.flushToDisk(kv);
    return true;
  }

  async remove(key: string): Promise<boolean> {
    const kv = await this.kv();
    await kv.remove(key);
    await this.flushToDisk(kv);
    return true;
  }

  async containsKey(key: string): Promise<boolean> {
    const kv = await this.kv();
    return kv.containsKey(key);
  }

  async getNumber(key: string): Promise<number | undefined> {
    const kv = await this.kv();
    return kv.getNumber(key);
  }

  async putNumber(key: string, value: number): Promise<boolean> {
    const kv = await this.kv();
    await kv.putNumber(key, value);

    await this.flushToDisk(kv);
    return true;
  }

  async getBigInt(key: string): Promise<bigint | undefined> {
    const kv = await this.kv();
    return kv.getBigInt(key);
  }

  async putBigInt(key: string, value: bigint): Promise<boolean> {
    const kv = await this.kv();
    await kv.putBigInt(key, value);
    await this.flushToDisk(kv);
    return true;
  }

  async iterRange(
    startKey: string,
    endKey: string
  ): Promise<AsyncIterable<KV>> {
    const kv = await this.kv();
    return await kv.iterRange(startKey, endKey);
  }

  async iterPrefix(prefix: string): Promise<AsyncIterable<KV>> {
    const kv = await this.kv();
    return await kv.iterPrefix(prefix);
  }

  async putMany(kvs: KV[]): Promise<boolean> {
    const kv = await this.kv();
    await kv.putMany(kvs);
    await this.flushToDisk(kv);
    return true;
  }

  async getMany(keys: string[]): Promise<KV[]> {
    const kv = await this.kv();
    return await kv.getMany(keys);
  }

  async removeMany(keys: string[]): Promise<boolean> {
    const kv = await this.kv();
    await kv.removeMany(keys);
    await this.flushToDisk(kv);
    return true;
  }

  async clear(): Promise<void> {
    const emptyKV = new InMemoryKVStore();
    await this.flushToDisk(emptyKV);
    this.kv = thunk(loadKVfromDump);
  }

  async close(): Promise<void> {
    return;
  }
}
