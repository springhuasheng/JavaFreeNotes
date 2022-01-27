# myBast xml映射文件
```xml
<?xml version="1.0" encoding="UTF-8" ?>

<!DOCTYPE mapper

PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"

"http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.heima.user.mapper.ApUserMapper">

<!--

在resources目录下 创建和mapper一样的路径

然后创建mpper类同名的xml文件

-->

  

<!--字段映射-->

<!--type 为pojo包路径-->

<resultMap id="ApUserMapper" type="com.heima.model.user.pojos.ApUser">

<!--property 为pojo字段 column 为数据库字段-->

<result property="certification" column="is_certification"/>

<result property="identityAuthentication" column="is_identity_authentication"/>

<result property="createdTime" column="created_time"/>

</resultMap>

  
  

<!--根据用户手机号查询用户-->

<select id="findApUserByPhone" resultMap="ApUserMapper">

SELECT * FROM ap_user WHERE ap_user.phone = #{phone};

</select>

  

</mapper>
```

# 批量添加示例
```java
/**  
 * 批量添加 素材信息表  
 */  
void saveRelations(@Param("materialIds") List<Integer> materialIds, @Param("newsId") Integer newsId, @Param("type")Short type);
```

```xml
<insert id="saveRelations">  
 insert into wm_news_material (material_id,news_id,type,ord)  
    values  
    <foreach collection="materialIds" index="ord" item="mid" separator=",">  
 (#{mid},#{newsId},#{type},#{ord})  
    </foreach>  
</insert>
```

# 查看所有示例
```java
/**  
 * 查看所有品牌  
 * 参数:无  
 * 返回值类型:集合  
 */  
List<Brand> findAllBrand();
```

```xml
<!--查看所有品牌-->  
<select id="findAllBrand" resultMap="brandResultMap">  
 	select * from tb_brand;  
</select>
```

# 添加单个示例
>此处Brand对象添加@Param注解, xml中得使用brand.brandName方式获取属性

```java
/**  
 * 添加品牌  
 * 参数:实体类  
 * 返回值:Integer  
 */
Integer addBrand(Brand brand);
```

```xml
<!--添加品牌-->  
<insert id="addBrand">  
	insert into tb_brand values (null ,#{brandName},#{companyName},#{ordered},#{description},#{status});  
</insert>
```

# 根据id修改示例
```java
/**  
 * 根据id修改品牌  
 * 参数:实体类  
 * 返回值:无  
 */  
Integer updateBrand(Brand brand);
```

```xml
<update id="updateBrand">  
update  tb_brand set  
tb_brand.brand_name = #{brandName},  
tb_brand.company_name = #{companyName},  
tb_brand.ordered = #{ordered},  
tb_brand.description = #{description},  
tb_brand.status = #{status}  
where id = #{id} ;  
</update>
```

# 批量删除示例

>应注重foreach标签的使用
>批量删除使用不到应该

```java
/**  
 * 批量删除  
 * 参数:数组  
 * 返回值:无  
 */  
Integer removeByIds(@Param("ids") Integer[] ids);
```

```xml
<!--批量删除  
collection对应传入的参数  
item为集合或数组中的单个对象  
separator中间使用的分隔 一般为 ","open 拼接的 开头 符号  
close 拼接的 结尾 符号  
-->
<delete id="removeByIds">  
 delete from tb_brand where id in  
    <foreach collection="ids" item="id" separator="," open="(" close=")">  
 #{id}  
    </foreach>  
</delete>
```

# 分页查询示例

```java
/**  
 * 分页查询  
 * 参数:起始页码, 显示的数据的条数  
 * 返回值:集合  
 */  
List<Brand> selectByPage(@Param("begin") int begin,@Param("size") int size);
```

```xml
<!--分页查询-->  
<select id="selectByPage" resultMap="brandResultMap">  
 select * from tb_brand limit #{begin},#{size};  
</select>
```

# 查询数据条数

```java
/**  
 * 查看数据的条数  
 * 参数:无  
 * 返回值:int  
 */
int selectTotalCount();
```

```xml
<!--查看数据的条数-->  
<!--注意这里的返回值类型为 int   resultType="int"  -->
<select id="selectTotalCount" resultType="int">  
 select count(*) from tb_brand ;  
</select>
```

# 分页查询&条件查询
>注意: 
>1.where标签就是where关键字 注意使用
>2.if标签会自动拼接逗号

```java
/**  
 * 分页查询&条件查询  
 * 参数:起始页码 每页显示的条数  
 * 参数:实体类 条件查询  
 * 返回值:集合  
 */  
List<Brand> selectByPageAndCondition(@Param("begin") int begin,@Param("size") int size,@Param("brand") Brand brand);
```

```xml
<!--分页查询&条件查询-->  
<select id="selectByPageAndCondition" resultMap="brandResultMap">  
 select *  
 from tb_brand  
 <where>  
 <if test="brand.brandName !=null and brand.brandName !='' ">  
 and brand_name like #{brand.brandName}  
        </if>  
 <if test="brand.companyName != null and brand.companyName != '' ">  
 and company_name like #{brand.companyName}  
        </if>  
 <if test="brand.status != null">  
 and status = #{brand.status}  
        </if>  
 </where> limit #{begin},#{size}  
</select>
```

# 根据条件查询的总数
```java
/**  
 * 根据条件查询 的总数  
 * 参数:实体类  
 * 返回值:Integer  
 */
Integer selectTotalCountByCondition(Brand brand);
```

```xml
<!--条件查询到的总条数-->  
<select id="selectTotalCountByCondition" resultType="java.lang.Integer">  
 select count(*)  
    from tb_brand  
    <where>  
 <if test="brandName !=null and brandName !='' ">  
 and brand_name like #{brandName}  
        </if>  
 <if test="companyName != null and companyName != '' ">  
 and company_name like #{companyName}  
        </if>  
 <if test="status != null">  
 and status = #{status}  
        </if>  
 </where>
</select>
```



